'use client';

import { useState } from 'react';
import { PROTOCOLS, type ProtocolId } from './tokens';
import { apiBase } from '@/lib/brand';

/**
 * 首屏「一行式地址条」（v9，2026-11-14）
 *
 * 上一版是四层高的大卡片（标签 + 大号地址 + 复制 / 协议 tab / 端点 / 代码），
 * 它把首屏撑成了后台面板：首屏只该回答一个问题——「我该复制哪一行」。
 *
 * 参照 teamorouter 的做法：协议下拉 + 地址 + 复制，三个控件一行，高 44px。
 * 其余信息（四条路径、鉴权、多语言示例）下移到紧随其后的「三种协议，四条路径」区，
 * 那里用完整版 ProtocolTabs（variant="paths"），两处不重复同一个地址的大标题。
 *
 * 下拉用原生 <select>：键盘、读屏、移动端选择器全部免费，不自己做弹层。
 */
export function AddressBar() {
  const [protocol, setProtocol] = useState<ProtocolId>(PROTOCOLS[0].id);
  const [copied, setCopied] = useState(false);
  const baseUrl = `${apiBase}/v1`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(baseUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板不可用时静默失败，地址仍可手动选中 */
    }
  }

  return (
    /* 2026-11-16 晚：墨色改浅蓝白。
       墨色那条跟星空同色系，远看是一条影子，地址反而要凑近找——首屏最该被看见的就是这一行。
       换成浅蓝白（不是纯白：纯白是主行动按钮的份，见 7.1 与按钮层级），跟夜空同一蓝家族，
       明度提上去而不跳出色系；8px 圆角 + 浅蓝描边 + 向下压的柔和阴影，
       让它像一块「浮在画面上的控件」，而不是贴上去的一条白纸条。 */
    <div className="flex h-12 w-full items-stretch overflow-hidden rounded-control border border-brand-200 bg-brand-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(10,37,64,0.05),0_18px_44px_-12px_rgba(2,10,32,0.65)]">
      <div className="relative flex shrink-0 items-center border-r border-brand-200">
        <label htmlFor="hero-protocol" className="sr-only">
          协议
        </label>
        <select
          id="hero-protocol"
          value={protocol}
          onChange={(event) => setProtocol(event.target.value as ProtocolId)}
          className="h-full cursor-pointer appearance-none bg-transparent pl-3.5 pr-8 text-[13px] font-medium text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          {PROTOCOLS.map((item) => (
            <option key={item.id} value={item.id} className="text-ink">
              {item.tab}
            </option>
          ))}
        </select>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
          className="pointer-events-none absolute right-3 text-ink-mid"
        >
          <path d="M2 3.5 5 6.5 8 3.5" />
        </svg>
      </div>

      <code className="flex min-w-0 flex-1 items-center truncate px-3.5 font-mono text-[13px] text-ink">
        {baseUrl}
      </code>

      <button
        type="button"
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 border-l border-brand-200 px-3.5 text-[13px] font-medium text-brand-700 transition-colors hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </svg>
        <span className="hidden sm:inline">{copied ? '已复制' : '复制'}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? '地址已复制到剪贴板' : ''}
      </span>
    </div>
  );
}

