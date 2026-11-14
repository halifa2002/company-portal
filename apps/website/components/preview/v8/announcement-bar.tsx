'use client';

/**
 * 顶部通告条（2026-11-14 第二版：照 teamorouter 做成黑条）
 *
 * 第一版是浅灰底 + 深字的"信息带"，看起来像网站的页脚声明，没有存在的必要。
 * 参考站是**黑底白字**：深色条压在白色页头之上，进来第一眼的视觉重心就在这条上，
 * 它才真的能承担「当前有什么值得点进去」的作用。
 *
 * 结构对照参考站：
 *   左侧一枚四角星（我们用自己的品牌蓝，不抄它的彩虹渐变）
 *   → 主体一句「X 现已上线，低至官方 N 折」的结构，我们换成真实内容
 *   → 关键数字用暖橙强调（token 里唯一的暖色，只给一个词用）
 *   → 右侧一个 × 可关闭（参考站也有，是可关闭的）
 *
 * 文字必须真实：没有折扣就不写折扣。
 */

import { useState } from 'react';
import Link from 'next/link';

function Spark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path
        d="M8 0.5c.5 4 3 6.5 7 7.5-4 1-6.5 3.5-7 7.5-.5-4-3-6.5-7-7.5 4-1 6.5-3.5 7-7.5Z"
        fill="url(#ann-spark)"
      />
      <defs>
        <linearGradient id="ann-spark" x1="1" y1="1" x2="15" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ccbff" />
          <stop offset="1" stopColor="#188df9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AnnouncementBar(props: { modelCount: number }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="relative bg-code text-white">
      <div className="mx-auto flex w-full max-w-[1280px] items-center gap-2.5 px-6 py-2 md:px-10">
        <Spark />

        <p className="min-w-0 flex-1 truncate text-meta">
          <span className="font-semibold text-white">已接入 {props.modelCount} 个模型</span>
          <span className="mx-1.5 text-white/35">·</span>
          <span className="text-white/75">OpenAI / Claude / Gemini 三协议共用一套地址</span>
          <Link
            href="/models"
            className="ml-2 whitespace-nowrap font-medium text-accent-warm transition-colors hover:text-accent-warm/80"
          >
            查看模型清单 →
          </Link>
        </p>

        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="关闭通告"
          className="-mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
