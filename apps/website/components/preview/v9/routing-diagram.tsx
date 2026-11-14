import type { ReactNode } from 'react';
import { LogoMark } from '@portal/ui';
import { VendorLogo } from '../vendor-logo';
import { ClientLogo } from './client-logo';

/**
 * 首屏路由图（v9，2026-11-14）
 *
 * 参照 teamorouter 首屏的那张图：左边一列模型厂商、右边一列客户端，
 * 中间一个圆形的「网关」，三侧用极细的曲线连起来。
 *
 * 为什么要这张图：文字说一百遍「多模型统一入口」，不如一张图讲完
 * 「左边这么多厂商 → 中间归一 → 右边这些工具都能用我们的地址」。
 * 首屏缺的从来不是信息，是**画面**。
 *
 * 画法上的克制：
 *   - 曲线只有 6 根、1px 细、透明度 0.22~0.30，不发光、不流动、不做粒子；
 *   - 卡片就是白底 + 细边，圆角 6px，和页头按钮的直角语言拉开但不冲突；
 *   - 小屏（<lg）不成图，直接上下堆叠，避免曲线在窄屏上糊成一团。
 */

const CLIENTS = ['Claude Code', 'Codex', 'Cursor', 'Cherry Studio', 'Chatbox', 'Dify'];

/** 6 根连接线（viewBox 1000×240；容器 1200 宽 → 左列右沿 250、hub 430–570、右列左沿 750） */
const WIRES: { d: string; color: string }[] = [
  { d: 'M250 58C330 58 350 120 430 120', color: 'var(--hero-wire-strong)' },
  { d: 'M250 120C330 120 360 120 430 120', color: 'var(--hero-wire-mid)' },
  { d: 'M250 182C330 182 350 120 430 120', color: 'var(--hero-wire-soft)' },
  { d: 'M570 120C650 120 670 58 750 58', color: 'var(--hero-wire-strong)' },
  { d: 'M570 120C650 120 680 120 750 120', color: 'var(--hero-wire-mid)' },
  { d: 'M570 120C650 120 670 182 750 182', color: 'var(--hero-wire-soft)' },
];

function Hub() {
  return (
    <div className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full border border-white bg-white/75 shadow-[0_14px_50px_rgba(216,118,66,0.16)] backdrop-blur">
      <div className="absolute inset-[10px] rounded-full border border-dashed border-brand-500/20" aria-hidden />
      <div className="relative text-center">
        {/* 中心这枚就是品牌标本身：直接用 ui 包的 LogoMark，全站只有一个来源。
         * 2026-11-14 改：原来这里画的是「两个方框 + 一条连线」的自造图形，
         * 用户指出「这个标应该是我们的 logo」——中心位是整张图的主角，
         * 放品牌标比放一个像通用图标的符号更合逻辑。 */}
        <div className="mb-2 flex justify-center">
          <LogoMark size="xs" />
        </div>
        <span className="block text-[13px] font-medium text-ink">协议归一</span>
        <span className="mt-0.5 block text-[11px] text-ink-soft">一个地址</span>
      </div>
    </div>
  );
}

function Label(props: { children: ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
      {props.children}
    </p>
  );
}

export function RoutingDiagram(props: { vendors: string[] }) {
  return (
    <div className="relative">
      {/* 连接线：只在 lg 以上出现，纵向拉伸不影响 1px 线宽 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        viewBox="0 0 1000 240"
        preserveAspectRatio="none"
      >
        {WIRES.map((wire) => (
          <path
            key={wire.d}
            d={wire.d}
            fill="none"
            stroke={wire.color}
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="relative grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:items-center lg:gap-0">
        {/* 左：模型厂商 */}
        <div>
          <Label>模型厂商 · {props.vendors.length} 家</Label>
          <div className="grid grid-cols-2 gap-2">
            {props.vendors.map((vendor) => (
              <span
                key={vendor}
                className="flex min-w-0 items-center gap-2 rounded-[6px] border border-white bg-white/85 px-3 py-2.5 text-[13px] text-ink-mid shadow-[0_2px_8px_rgba(120,62,32,0.06)] backdrop-blur"
              >
                <VendorLogo vendor={vendor} size={18} />
                <span className="min-w-0 truncate">{vendor}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 中：网关 */}
        <div className="flex justify-center lg:py-2">
          <Hub />
        </div>

        {/* 右：客户端 */}
        <div>
          <Label>客户端与工具 · {CLIENTS.length} 个</Label>
          <div className="grid grid-cols-2 gap-2">
            {CLIENTS.map((client) => (
              <span
                key={client}
                className="flex min-w-0 items-center gap-2 rounded-[6px] border border-white bg-white/85 px-3 py-2.5 text-[13px] text-ink-mid shadow-[0_2px_8px_rgba(120,62,32,0.06)] backdrop-blur"
              >
                <ClientLogo name={client} size={18} />
                <span className="min-w-0 truncate">{client}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}






