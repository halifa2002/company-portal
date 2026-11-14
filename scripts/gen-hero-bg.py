#!/usr/bin/env python3
"""生成首屏背景（预览页 v9）。

为什么用程序生成而不是 CSS / 生图 API：
  - CSS 渐变的每个色标都必须浅到能压住正文（C-V-02 要求 4.5:1），最后只能得到
    「一条平滑渐变」——实测 8×6 网格色块标准差只有 11.4，而参考站是 20.5 / 28.7。
    差距不在网点细不细，而在**大色块有没有层次**。
  - 生图 API 出来的纹理不可控：色相、明度、对比度都可能越出蓝族（违反 C-V-03），
    还可能带文字/水印伪影。
  - 程序生成：色板写死为蓝族（色相 208–216°），逐像素钳制最低明度保证文字对比度，
    可复现、零 API 成本、零版权问题。

输出：apps/website/public/hero/canvas.webp
用法：python scripts/gen-hero-bg.py
"""

import os
import numpy as np
from PIL import Image, ImageFilter

W, H = 1920, 960
SEED = 20261114

import sys

WARM = "--warm" in sys.argv
COOL = "--cool" in sys.argv
OUT = os.path.join(
    os.path.dirname(__file__),
    "..",
    "apps",
    "website",
    "public",
    "hero",
    "canvas-warm.webp" if WARM else ("canvas-cool.webp" if COOL else "canvas.webp"),
)

# 次暖色板（冷主暖次用）：比 RAMP_WARM 低一档饱和度，读作「余温」而不是「主色」
RAMP_WARM_SOFT = [
    (1.000, (255, 255, 255)),
    (0.975, (255, 250, 245)),
    (0.945, (255, 241, 229)),
    (0.905, (255, 228, 210)),
    (0.860, (255, 212, 190)),
    (0.815, (252, 196, 172)),
    (0.775, (247, 181, 156)),
]

# 暖色温色板（只在背景图里用，不进 tokens、不做任何强调色元素）
RAMP_WARM = [
    (1.000, (255, 255, 255)),
    (0.975, (255, 249, 243)),
    (0.945, (255, 238, 224)),
    (0.905, (255, 222, 200)),
    (0.860, (255, 202, 172)),
    (0.815, (252, 180, 148)),
    (0.775, (246, 162, 130)),
]

# 蓝族色板：明度系数 → 颜色（全部落在同一色相带：偏冷的天空蓝，不是紫、不是青绿）
# 顺序必须从浅到深；插值时按明度系数定位。
RAMP = [
    (1.000, (255, 255, 255)),
    (0.985, (252, 253, 255)),
    (0.960, (244, 250, 255)),
    (0.930, (232, 243, 255)),
    (0.895, (216, 233, 255)),
    (0.860, (199, 223, 253)),
    (0.825, (182, 212, 251)),
    (0.790, (168, 202, 249)),
]


def value_noise(h, w, cell, rng):
    """低分辨率随机场双线性放大 —— 便宜但有机的低频噪声。"""
    gh, gw = max(2, h // cell), max(2, w // cell)
    grid = rng.random((gh, gw)).astype(np.float32)
    img = Image.fromarray((grid * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(img).astype(np.float32) / 255.0


def fbm(h, w, octaves, base_cell, rng, persistence=0.5):
    """分形噪声（多倍频叠加）。8 分形噪声是「烟/云/墨」质感的标准做法。"""
    out = np.zeros((h, w), np.float32)
    amp, norm, cell = 1.0, 0.0, base_cell
    for _ in range(octaves):
        out += amp * value_noise(h, w, max(4, cell), rng)
        norm += amp
        amp *= persistence
        cell = max(4, cell // 2)
    return out / max(norm, 1e-6)


def main():
    rng = np.random.default_rng(SEED)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u = xx / W
    v = yy / H

    # ⑤ 域扭曲（domain warping）：这是「不是简单配色」的关键。
    # 上一版的每个色团是标准高斯（同心圆），放大看就是干干净净的渐变；
    # 参考站那层是**边界不规则、带丝缕**的雾。做法：先用分形噪声把坐标扭曲一遍，
    # 再在扭曲后的坐标里算色团——圆形立刻变成云、烟那种形状。
    wx = (fbm(H, W, 4, 210, rng) - 0.5) * 0.13
    wy = (fbm(H, W, 4, 210, rng) - 0.5) * 0.13
    uu = u + wx
    vv = v + wy

    # ① 底色：左上是白，往下往右下压深（给整幅画面一个方向）
    base = 0.985 - 0.115 * np.clip((v * 1.18 - u * 0.10), 0, 1)

    # ② 偏心色团：每个团有自己的中心/半径/权重，这是「大色块层次」的来源
    blobs = [
        # cx,   cy,   rx,   ry,   amp
        (0.46, -0.22, 0.66, 0.36, +0.055),  # 顶部主光：标题区留白
        (0.08, 0.02, 0.30, 0.26, +0.020),   # 左上微亮
        (0.96, 0.06, 0.40, 0.30, -0.090),   # 右上角压深（无文字区）
        (0.38, 0.44, 0.36, 0.30, +0.028),   # 中部提亮，托住标题与地址条
        (0.72, 0.86, 0.52, 0.34, -0.085),   # 右下沉色，托住路由图与胶囊
        (0.12, 0.80, 0.34, 0.30, -0.045),   # 左下沉色
        (0.50, 1.30, 0.92, 0.44, +0.040),   # 最底部回亮，收边
    ]
    field = np.zeros_like(u)
    for cx, cy, rx, ry, amp in blobs:
        d = ((uu - cx) / rx) ** 2 + ((vv - cy) / ry) ** 2
        field += amp * np.exp(-2.4 * d)

    # ③ 噪声分三层：大块起伏（让团块彼此不等大）/ 中频肌理（云斑，放大可见）/ 细颗粒
    field += (fbm(H, W, 3, 240, rng) - 0.5) * 0.045
    field += (fbm(H, W, 4, 70, rng) - 0.5) * 0.034
    field += (fbm(H, W, 3, 22, rng) - 0.5) * 0.014
    field += (value_noise(H, W, 5, rng) - 0.5) * 0.007
    # 逐像素细颗粒：参考站那块背景的高频能量是 6.0，我们只有 2.9——
    # 差的就是这一层「胶片颗粒」。幅度必须很小（±1.5 级），否则成图会脏。
    field += rng.standard_normal((H, W)).astype(np.float32) * 0.006
    fine = value_noise(H, W, 2, rng) - 0.5
    field += fine * 0.020

    lum = base + field

    # ④ 明度钳制：文字区（上 72%）不允许低于 0.845，否则 ink-mid 压不住 4.5:1；
    #    底部 28% 可以再深一点，因为那里的能力胶囊是白底 70%。
    # 注意：区域边界必须**羽化**。上一版用 np.where 直接切矩形，成图上留下了一个
    # 明显的浅色方块（路由图右侧标签带的提亮区）。这里统一用高斯羽化后的掩膜相乘。
    def soft(cond, radius=90):
        m = Image.fromarray((cond * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))
        return np.asarray(m).astype(np.float32) / 255.0

    floor = np.full_like(v, 0.855)
    floor = floor * (1 - 0.065 * soft(v > 0.70, 110))                       # 底部下沉
    floor = floor * (1 - 0.050 * soft((v < 0.22) & (u > 0.82), 90))         # 右上角压深
    floor = floor * (1 - 0.120 * soft((np.abs(u - 0.5) < 0.19) & (v > 0.56), 80))  # 圆盘背后
    label_zone = ((u < 0.26) | (u > 0.74)) & (v > 0.40) & (v < 0.76)
    floor = floor + (0.905 - floor) * soft(label_zone, 90)                   # 标签带提亮（羽化）
    lum = np.clip(lum, floor, 1.0)

    # ⑤ 按色板插值得到 RGB
    def ramp_rgb(lum_field, ramp):
        stops = np.array([s[0] for s in ramp])
        cols = np.array([s[1] for s in ramp], dtype=np.float32)
        flat = lum_field.ravel()
        idx = np.searchsorted(-stops, -flat, side="right") - 1
        idx = np.clip(idx, 0, len(stops) - 2)
        t = np.clip((stops[idx] - flat) / (stops[idx] - stops[idx + 1]), 0, 1)[:, None]
        return cols[idx] * (1 - t) + cols[idx + 1] * t

    if COOL:
        # 冷主暖次（2026-11-14 用户定调）：整幅是蓝，只有**一小团**暖光做次色，
        # 位置放在路由图正下方偏左——那里没有正文，暖光只托住圆盘与胶囊。
        # 比例控制在 20% 以内（实测约 15%），饱和度也比暖主版低一档，
        # 读起来是「灯下的一层余温」，不是第二个主色。
        temp = np.zeros_like(u)
        for cx, cy, rx, ry, amp in [
            (0.50, 0.50, 0.95, 1.05, -1.25),   # 全幅冷（主）
            (0.94, 0.14, 0.34, 0.40, -0.55),   # 右上再冷一档，压出纵深
            (1.03, 0.46, 0.26, 0.86, +3.10),   # 右侧一条竖暖雾（参照站把冷放在右侧，我们反过来把暖放右侧）
            (0.02, 0.55, 0.24, 0.90, -0.45),   # 左侧再冷一档，压出纵深
            (0.50, 0.82, 0.22, 0.30, -0.35),   # 圆盘背后冷柱
        ]:
            # 色温场同样在**扭曲后的坐标**里算，暖雾的边界才不是一条干净直线
            d = ((uu - cx) / rx) ** 2 + ((vv - cy) / ry) ** 2
            temp += amp * np.exp(-2.2 * d)
        temp += (value_noise(H, W, 140, rng) - 0.5) * 0.28
        wmix = (0.5 + 0.5 * np.tanh(temp * 1.9)).ravel()[:, None]
        rgb = ramp_rgb(lum, RAMP_WARM_SOFT) * wmix + ramp_rgb(lum, RAMP) * (1 - wmix)
        img = rgb.reshape(H, W, 3)
    elif WARM:
        # 色温场：左下大片暖团 + 右侧冷团 + 底部再压一层暖（对齐参考站的结构）
        temp = np.zeros_like(u)
        for cx, cy, rx, ry, amp in [
            (0.34, 0.74, 0.66, 0.58, +1.00),
            (0.93, 0.28, 0.44, 0.54, -1.10),
            (0.62, 1.00, 0.52, 0.36, +0.55),
            (0.10, 0.16, 0.30, 0.26, +0.35),
        ]:
            d = ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2
            temp += amp * np.exp(-2.0 * d)
        temp += (value_noise(H, W, 120, rng) - 0.5) * 0.45
        wmix = (0.5 + 0.5 * np.tanh(temp * 1.7)).ravel()[:, None]
        rgb = ramp_rgb(lum, RAMP_WARM) * wmix + ramp_rgb(lum, RAMP) * (1 - wmix)
        img = rgb.reshape(H, W, 3)
    else:
        img = ramp_rgb(lum, RAMP).reshape(H, W, 3)

    # ⑥ 极淡的角部收边（vignette），让画面有边界感
    vig = 1 - 0.035 * (((u - 0.5) ** 2 + (v - 0.45) ** 2) / 0.36)
    img = np.clip(img * vig[:, :, None], 0, 255).astype(np.uint8)

    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    Image.fromarray(img).save(OUT, "WEBP", quality=92, method=6)
    size = os.path.getsize(OUT)
    print(f"wrote {os.path.abspath(OUT)}  {W}x{H}  {size/1024:.0f} KB")
    print(f"luminance range: {lum.min():.3f}–{lum.max():.3f}")


if __name__ == "__main__":
    main()















