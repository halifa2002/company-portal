from PIL import Image, ImageFilter, ImageDraw
import os

src = r"C:\Users\lo\Desktop\chongdong-ai\dsh-image-gen\image-b12c8ee2.png"
dst = r"C:\Users\lo\Desktop\chongdong-ai\company-portal\apps\website\public\hero\starfield-dawn-4k.webp"

im = Image.open(src).convert("RGB")
tw, th = 3840, 2160
sw, sh = im.size
scale = max(tw / sw, th / sh)
im = im.resize((int(round(sw * scale)), int(round(sh * scale))), Image.LANCZOS)
nw, nh = im.size
left, top = (nw - tw) // 2, (nh - th) // 2
im = im.crop((left, top, left + tw, top + th))

# 底部渐隐到页面底色 #eef6ff：82% 起淡出，避免与下一屏白底之间出现硬边
bg = (238, 246, 255)
mask = Image.new("L", (1, th), 0)
px = mask.load()
start, end = int(th * 0.80), th
for y in range(th):
    if y <= start:
        v = 0
    else:
        t = (y - start) / (end - start)
        v = int(round(255 * (t ** 1.35)))
    px[0, y] = v
mask = mask.resize((tw, th), Image.BILINEAR)
solid = Image.new("RGB", (tw, th), bg)
im = Image.composite(solid, im, mask)

im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=65, threshold=2))
im.save(dst, "WEBP", quality=82, method=6)
print("final", im.size, os.path.getsize(dst), "bytes")
