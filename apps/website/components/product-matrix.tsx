/**
 * 产品能力矩阵 —— 首页「平台能力介绍」区块。
 *
 * 版式取向来自领导文档第 155 行指定的 SiliconFlow：2×2 大卡片，深色与浅色交错，
 * 每张卡右下角压一枚线框装饰。纯色大面积块会显得空，线框把视觉重量补回来。
 *
 * 装饰用的是抽象几何线条，不画具象插画：品牌主色通道一改，装饰跟着变。
 */

import Link from 'next/link';

type Tone = 'dark' | 'light';
type ArtKind = 'gateway' | 'billing' | 'routes' | 'quota';

export interface MatrixCard {
  key: string;
  title: string;
  desc: string;
  points: string[];
  href: string;
  cta: string;
  tone: Tone;
  art: ArtKind;
}

export const MATRIX_CARDS: MatrixCard[] = [
  {
    key: 'gateway',
    title: '一个 Key，调用多家模型',
    desc: '兼容 OpenAI、Claude、Gemini 三种主流协议，切换模型只改 model 字段，业务代码不用动。',
    points: ['三种协议同一套鉴权', '沿用现有 SDK'],
    href: '/docs',
    cta: '查看接入文档',
    tone: 'dark',
    art: 'gateway',
  },
  {
    key: 'billing',
    title: '用量与账单透明',
    desc: '每次调用记录输入输出的 token 数与扣费金额，账单可逐笔追溯，不搞预存套路。',
    points: ['逐笔消费明细', '按实际用量结算'],
    href: '/pricing',
    cta: '了解计费规则',
    tone: 'light',
    art: 'billing',
  },
  {
    key: 'routes',
    title: '多线路自动切换',
    desc: '同一个模型可以配多条上游线路，单条异常时自动重试切换，业务侧无感知。',
    points: ['异常自动重试', '可指定备用线路'],
    href: '/models',
    cta: '查看可用模型',
    tone: 'light',
    art: 'routes',
  },
  {
    key: 'quota',
    title: '额度分级管控',
    desc: '每个 Key 可单独设额度上限与模型权限，防止某个应用把整月预算吃光。',
    points: ['按 Key 限额', '按模型授权'],
    href: '/partner',
    cta: '企业接入咨询',
    tone: 'dark',
    art: 'quota',
  },
];

export function ProductMatrix() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {MATRIX_CARDS.map((card) => (
        <MatrixCardView key={card.key} card={card} />
      ))}
    </div>
  );
}

function MatrixCardView(props: { card: MatrixCard }) {
  const dark = props.card.tone === 'dark';

  return (
    <article
      className={`group relative overflow-hidden rounded-[24px] p-8 transition-all duration-300 md:p-10 ${
        dark
          ? 'text-white hover:-translate-y-0.5'
          : 'border border-black/6 bg-surface-tint text-ink hover:-translate-y-0.5 hover:border-brand/25'
      }`}
      style={dark ? { background: 'var(--matrix-dark)' } : undefined}
    >
      {/* 右下角线框装饰：深色卡用亮靛蓝，浅色卡用更淡的同色系 */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-6 -bottom-8 h-56 w-64 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 ${
          dark ? 'text-brand-accent/45' : 'text-brand/12'
        }`}
      >
        <MatrixArt kind={props.card.art} />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <h3 className={`text-[22px] font-bold tracking-tight md:text-2xl ${dark ? '' : 'text-ink'}`}>
          {props.card.title}
        </h3>

        <p
          className={`mt-4 max-w-lg text-sm leading-relaxed md:text-[15px] ${
            dark ? 'text-white/70' : 'text-ink/70'
          }`}
        >
          {props.card.desc}
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {props.card.points.map((point) => (
            <li
              key={point}
              className={`flex items-center gap-2 text-[13px] ${dark ? 'text-white/75' : 'text-ink/70'}`}
            >
              <span
                aria-hidden
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  dark ? 'bg-white/15' : 'bg-brand/12'
                }`}
              >
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5.2 4.1 7.2 8 3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {point}
            </li>
          ))}
        </ul>

        {/* mt-auto 让按钮在两张卡高度不齐时也贴着底边对齐 */}
        <div className="mt-9 md:mt-auto md:pt-10">
          <Link
            href={props.card.href}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
              dark
                ? 'bg-white text-[#1e1b4b] hover:-translate-y-px hover:bg-white/90'
                : 'text-white shadow-[0_8px_20px_rgba(79,70,229,0.22)] hover:-translate-y-px'
            }`}
            // 渐变只能走 background 简写：Tailwind 方括号任意值那套写法生成的是
            // background-color，渐变会被整条丢掉，按钮就成了透明的。
            style={dark ? undefined : { background: 'var(--gradient-primary)' }}
          >
            {props.card.cta}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/** 四种线框装饰。统一 240×220 视口，stroke 用 currentColor。 */
function MatrixArt(props: { kind: ArtKind }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (props.kind === 'gateway') {
    return (
      <svg viewBox="0 0 240 220" className="h-full w-full">
        <g {...common}>
          <rect x="12" y="86" width="52" height="48" rx="10" />
          <rect x="160" y="24" width="52" height="40" rx="9" />
          <rect x="160" y="102" width="52" height="40" rx="9" />
          <rect x="160" y="180" width="52" height="40" rx="9" />
          <path d="M64 110h40c8 0 12-4 12-12V56c0-8 4-12 12-12h32" />
          <path d="M64 110h96" />
          <path d="M64 110h40c8 0 12 4 12 12v48c0 8 4 12 12 12h32" />
        </g>
      </svg>
    );
  }

  if (props.kind === 'billing') {
    return (
      <svg viewBox="0 0 240 220" className="h-full w-full">
        <g {...common}>
          <path d="M28 176h184" />
          <rect x="44" y="120" width="26" height="56" rx="6" />
          <rect x="92" y="86" width="26" height="90" rx="6" />
          <rect x="140" y="52" width="26" height="124" rx="6" />
          <rect x="188" y="24" width="26" height="152" rx="6" />
          <path d="M28 150h184" strokeDasharray="5 7" />
        </g>
      </svg>
    );
  }

  if (props.kind === 'routes') {
    return (
      <svg viewBox="0 0 240 220" className="h-full w-full">
        <g {...common}>
          <rect x="10" y="94" width="46" height="40" rx="10" />
          <path d="M56 114h34" />
          <path d="M90 114c14 0 18-52 32-52h44" />
          <path d="M90 114h76" />
          <path d="M90 114c14 0 18 52 32 52h44" />
          <rect x="166" y="44" width="58" height="36" rx="9" />
          <rect x="166" y="96" width="58" height="36" rx="9" />
          <rect x="166" y="148" width="58" height="36" rx="9" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 220" className="h-full w-full">
      <g {...common}>
        <circle cx="112" cy="106" r="62" />
        <path d="M112 44v124" />
        <path d="M50 106h124" />
        <path d="M112 44a62 62 0 0 1 0 124" strokeDasharray="6 8" />
        <rect x="150" y="150" width="70" height="46" rx="10" />
        <path d="M166 173h38" />
        <path d="M176 162v22" />
      </g>
    </svg>
  );
}
