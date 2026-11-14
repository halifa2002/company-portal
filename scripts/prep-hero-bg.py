#!/usr/bin/env python3
"""把 AI 生成（或手工给的）背景图处理成首屏底图。

做三件事：
  1. 居中裁成 2:1 → 1920×960（hero 在 1920 宽下大概这么高）；
  2. **提亮到安全下限**：文字会压在这张图上，白色文字/深色文字的对比度都得保住。
     按区域给明度下限（中间文字带 0.90、边缘 0.86、底部 0.82），
     低于下限的像素按比例整体提亮（保持色相，不改变暖冷关系）；
  3. 叠一层细颗粒，压 WebP。

为什么必须做第 2 步：AI 出的图好看但不管你的对比度——中间那块蓝经常会压到 0.78，
深色标题压上去就不达标了。程序化生成时我可以直接钳明度，AI 图只能事后补救。

用法：python scripts/prep-hero-bg.py <输入图> [输出名]
"""

import os
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H = 1920, 960
SRC = sys.argv[1]
OUT_NAME = sys.argv[2] if len(sys.argv) > 2 else "canvas-ai.webp"
OUT = os.path.join(
    os.path.dirname(__file__), "..", "apps", "website", "public", "hero", OUT_NAME
)


def soft(cond, radius=110):
    m = Image.fromarray((cond * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(m).astype(np.float32) / 255.0


def main():
    img = Image.open(SRC).convert("RGB")
    # 居中裁成 2:1
    w, h = img.size
    target = W / H
    if w / h > target:
        new_w = int(h * target)
        img = img.crop(((w - new_w) // 2, 0, (w + new_w) // 2, h))
    else:
        new_h = int(w / target)
        img = img.crop((0, (h - new_h) // 2, w, (h + new_h) // 2))
    img = img.resize((W, H), Image.LANCZOS)

    a = np.asarray(img).astype(np.float32)
    lum = a.mean(axis=2) / 255.0

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u, v = xx / W, yy / H

    # 区域下限：文字带（中间 76% 宽、上半屏）0.90；两侧 0.86；底部 0.82
    floor = np.full_like(u, 0.880)
    floor = floor + (0.905 - floor) * soft((u > 0.08) & (u < 0.92) & (v < 0.86), 90)
    floor = floor * (1 - 0.035 * soft(v > 0.86, 90))

    scale = np.where(lum < floor, floor / np.maximum(lum, 1e-4), 1.0)
    # 提亮幅度过大时，超过 1.6 倍的部分用「向白混合」代替，避免整块过饱和
    scaled = np.clip(a * scale[:, :, None], 0, 255)
    over = np.clip((scale - 1.6) / 1.2, 0, 1)[:, :, None]
    whiteish = scaled + (255 - scaled) * over
    a = whiteish

    # 颗粒：AI 图本身偏干净，补 ±2 级
    rng = np.random.default_rng(11)
    a = a + rng.standard_normal((H, W, 1)).astype(np.float32) * 2.6

    out = np.clip(a, 0, 255).astype(np.uint8)
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    Image.fromarray(out).save(OUT, "WEBP", quality=95, method=6)

    lum2 = out.astype(np.float32).mean(axis=2) / 255.0
    print(f"wrote {os.path.abspath(OUT)}  {os.path.getsize(OUT)/1024:.0f} KB")
    print(f"luminance {lum.min():.3f} → {lum2.min():.3f} (min)  /  {lum2.max():.3f} (max)")
    print(f"提亮过的像素占比 {(scale > 1.01).mean()*100:.1f}%")


if __name__ == "__main__":
    main()

