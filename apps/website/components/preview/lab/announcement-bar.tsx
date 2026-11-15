'use client';

/**
 * 顶部通告条（2026-11-15 由 lab 实验版转正：对齐 teamorouter 的 launch-banner）
 *
 * 上一版是「深藏蓝底 + 蓝渐变星 + 一整句灰白文字 + 橙色小链接」，问题有三：
 *   ① 深藏蓝压在白色页头上，冷对冷，没有"条"的分量；
 *   ② 一整句塞了两条信息 + 一个链接，没有重点，眼睛不知道先看哪儿；
 *   ③ 只有"查看模型清单"可点，其余文字是死的。
 *
 * 参考站实测（CDP 抓的计算样式）：
 *   底色 #14110f 暖黑 / 字色 #fffefb 暖白 / 条高 44px / 正文 14px-20px / 间距 7px
 *   强调色 #fb8841（暖橙，用在"低至官方2.9折"这一句）
 *   左侧 18px 品牌 logo（Gemini 渐变星）→ 品牌名加粗 → "现已上线，" → 强调句
 *   整条是一个 <a>，箭头 hover 右移 4px，入场 0.52s 从上方落下
 *   底纹是 <canvas class="lb-stars"> 画的一层星点
 *
 * 这里保持同样的骨架，但**内容只写我们真实有的**：不编折扣。
 *   [品牌星] 27 个模型 已接入，三协议共用一套地址 →
 * 星点用 CSS 多层 radial-gradient 实现（零 JS），样式见 app/globals.css 的 .ann-stars。
 */

import { useState } from 'react';
import Link from 'next/link';
import { Arrow } from '@/components/ui/arrow';

/** 18px 品牌星（与参考站同尺寸，渐变走我们的蓝） */
function Spark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M20.6 10.8a14.1 14.1 0 0 1-4.45-3 14.1 14.1 0 0 1-3.68-6.45.5.5 0 0 0-.98 0 14.1 14.1 0 0 1-3.68 6.45 14.2 14.2 0 0 1-4.45 3c-.65.28-1.32.5-2 .68a.5.5 0 0 0 0 .98c.68.17 1.35.4 2 .68a14.1 14.1 0 0 1 4.45 3 14.1 14.1 0 0 1 3.68 6.45.5.5 0 0 0 .98 0c.17-.69.4-1.35.68-2a14.1 14.1 0 0 1 3-4.45 14.1 14.1 0 0 1 6.45-3.68.5.5 0 0 0 0-.98 13.2 13.2 0 0 1-2-.68Z"
        fill="url(#lab-ann-spark)"
      />
      <defs>
        <linearGradient id="lab-ann-spark" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ccbff" />
          <stop offset="0.55" stopColor="#188df9" />
          <stop offset="1" stopColor="#4a55e6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AnnouncementBar(props: { modelCount: number }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="ann relative overflow-hidden">
      <div className="ann-stars" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-[1280px] items-center justify-center px-6 md:px-10">
        <Link
          href="/models"
          className="group flex min-h-[44px] items-center justify-center gap-[7px] py-3 pr-8 text-center text-[14px] leading-5"
        >
          <Spark />
          <span className="font-semibold">{props.modelCount} 个模型</span>
          <span className="text-[#fffefb]/75">三协议已接入，</span>
          <em className="font-semibold not-italic text-[#fb8841]">一个地址全通</em>
          <Arrow className="text-[#fffefb]/70" />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="关闭通告"
        className="absolute right-3 top-1/2 inline-flex h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-md text-[#fffefb]/55 transition-colors duration-150 hover:bg-white/10 hover:text-[#fffefb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    </div>
  );
}
