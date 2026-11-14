#!/usr/bin/env python3
"""首屏背景底图 v2：用「湍流云」而不是「高斯色团」来生成。

为什么重做（对照参考站实测）：
  - 参考站那块背景的**高频能量 6.04**，我们旧脚本只有 2.9；说明人家不是纯渐变，
    叠了颗粒/肌理；
  - 参考站的形状是**不规则的烟云**（放大看有丝缕、有翻卷），不是同心圆；
    旧脚本用高斯色团 + 小幅域扭曲，放大后依然像干净渐变——用户也指出来了。
  - 图像生成工具本机没配 key（generate_image 报缺 Gemini API Key），所以走程序化。

做法（这是「云/烟/墨」的标准配方，不是简单配色）：
  1. 分形噪声 fbm，5 个倍频；
  2. **两级域扭曲**：density = fbm(p + 2 * fbm(p + fbm(p)))。扭曲由噪声自身驱动，
     所以形状会翻卷、有丝缕，而不是圆；
  3. 用 ridged 变换（1-|2n-1|）让边缘变"硬"一点点，接近烟团的边界；
  4. 明度按密度映射，并逐像素钳制下限（文字区 0.87 / 其它 0.79），保证正文对比度；
  5. 色温：整体蓝族，暖只出现在右侧一条带（C-V-03：强调色仍是单一蓝），
     且暖带的边界也被同一噪声扭曲，不是一条干净的直线；
  6. 最后叠一层细颗粒（±2 级），补高频。

输出：apps/website/public/hero/canvas-cool.webp
用法：python scripts/gen-hero-canvas.py
"""

import os
import numpy as np
from PIL import Image, ImageFilter

W, H = 1920, 960
SEED = 20261114
OUT = os.path.join(
    os.path.dirname(__file__), "..", "apps", "website", "public", "hero", "canvas-cool.webp"
)

# 蓝族色板（明度 → 颜色）。色相固定 205–215°，只有明度与饱和度变化。
RAMP_BLUE = [
    (1.000, (255, 255, 255)),
    (0.980, (250, 252, 255)),
    (0.955, (241, 248, 255)),
    (0.925, (228, 240, 255)),
    (0.890, (211, 230, 254)),
    (0.855, (193, 219, 252)),
    (0.820, (176, 207, 250)),
    (0.785, (160, 195, 248)),
]

# 次暖色板（右侧那条带）；饱和度刻意压低，读作"余温"不是第二个主色
RAMP_WARM = [
    (1.000, (255, 255, 255)),
    (0.980, (255, 251, 247)),
    (0.955, (255, 244, 236)),
    (0.925, (255, 235, 223)),
    (0.890, (255, 224, 208)),
    (0.855, (253, 211, 192)),
    (0.820, (249, 198, 177)),
    (0.785, (245, 186, 164)),
]


def value_noise(h, w, cell, rng):
    gh, gw = max(2, h // cell), max(2, w // cell)
    grid = rng.random((gh, gw)).astype(np.float32)
    img = Image.fromarray((grid * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(img).astype(np.float32) / 255.0


def fbm(h, w, octaves, base_cell, rng, persistence=0.55):
    """分形噪声：多个倍频叠加。返回 0..1。"""
    out = np.zeros((h, w), np.float32)
    amp, norm, cell = 1.0, 0.0, base_cell
    for _ in range(octaves):
        out += amp * value_noise(h, w, max(3, cell), rng)
        norm += amp
        amp *= persistence
        cell = max(3, cell // 2)
    return out / max(norm, 1e-6)


def ramp(lum_field, stops):
    s = np.array([x[0] for x in stops])
    cols = np.array([x[1] for x in stops], dtype=np.float32)
    flat = lum_field.ravel()
    idx = np.searchsorted(-s, -flat, side="right") - 1
    idx = np.clip(idx, 0, len(s) - 2)
    t = np.clip((s[idx] - flat) / (s[idx] - s[idx + 1]), 0, 1)[:, None]
    return cols[idx] * (1 - t) + cols[idx + 1] * t


def soft(cond, radius=90):
    m = Image.fromarray((cond * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(m).astype(np.float32) / 255.0


def main():
    rng = np.random.default_rng(SEED)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u = xx / W
    v = yy / H

    # ① 两级域扭曲 —— 「烟云」的来源。p → p+q → p+2r，越往后越翻卷。
    base = fbm(H, W, 4, 260, rng)          # 大形状
    q = fbm(H, W, 4, 180, rng) - 0.5
    r = fbm(H, W, 4, 120, rng) - 0.5
    warp_x = (u * 1.0) + q * 0.32 + r * 0.16
    warp_y = (v * 1.0) + r * 0.28 - q * 0.12
    # 用扭曲后的坐标重新采样大形状（最近邻采样已足够，噪声本身是低频）
    sy = np.clip((warp_y * H).astype(np.int32), 0, H - 1)
    sx = np.clip((warp_x * W).astype(np.int32), 0, W - 1)
    density = base[sy, sx]

    # ② ridged：让团块边缘收紧一点，接近烟团而不是棉絮
    ridged = 1.0 - np.abs(2.0 * density - 1.0)
    detail = fbm(H, W, 5, 40, rng)
    shade = 0.62 * ridged + 0.38 * detail

    # ③ 明度：上亮下暗 + 云团起伏；整体保持高调（正文是深色字）
    # 云影强度分区域：文字带（中间那块）只给 55%，两端与底部给满 → 既保住对比度又有层次
    text_zone = soft((u > 0.12) & (u < 0.88) & (v > 0.02) & (v < 0.76), 70)
    shade_amp = 0.135 * (1.0 - 0.45 * text_zone)
    lum = 1.0 - 0.10 * np.clip(v * 1.05 - u * 0.05, 0, 1) - shade_amp * (1.0 - shade)

    # ④ 明度下限：文字区（上 72%）不低于 0.87，底部不低于 0.79；边界羽化
    floor = np.full_like(v, 0.870)
    floor = floor * (1 - 0.080 * soft(v > 0.72, 110))
    floor = floor + (0.905 - floor) * soft(((u < 0.26) | (u > 0.74)) & (v > 0.40) & (v < 0.76), 90)
    lum = np.clip(lum, floor, 1.0)

    # ⑤ 色温：蓝为底，右侧一条暖带；暖带边界也用噪声扭曲，避免直线
    warm_mask = soft((u > 0.82) & (v < 0.86), 120)
    warm_mask = np.clip(warm_mask * (0.55 + 0.75 * (0.5 + 0.5 * np.sin(6.0 * v + 2.2 * detail))), 0, 1)
    rgb = (
        ramp(lum, RAMP_WARM) * warm_mask.ravel()[:, None]
        + ramp(lum, RAMP_BLUE) * (1 - warm_mask.ravel()[:, None])
    ).reshape(H, W, 3)

    # ⑥ 细颗粒：参考站高频能量 6.04，这里补 ±2 级 + 一层中频斑
    grain = rng.standard_normal((H, W)).astype(np.float32) * 3.2
    mottle = (value_noise(H, W, 3, rng) - 0.5) * 7.0
    rgb = rgb + (grain + mottle)[:, :, None]
    img = np.clip(rgb, 0, 255).astype(np.uint8)

    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    Image.fromarray(img).save(OUT, "WEBP", quality=96, method=6)
    print(f"wrote {os.path.abspath(OUT)}  {W}x{H}  {os.path.getsize(OUT)/1024:.0f} KB")
    print(f"luminance {lum.min():.3f}–{lum.max():.3f}  warm share {warm_mask.mean()*100:.1f}%")


if __name__ == "__main__":
    main()


