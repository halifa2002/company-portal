import { SectionEyebrow } from '@/components/ui/section-eyebrow';

/**
 * S7：为什么是这个价（2026-11-14 视觉第四版）。
 *
 * 演进：线框小图标 → 蓝渐变矢量 → AI 立体位图 → **高度抽象的几何双色**。
 * 用户最后给的是参考站那种「2～3 个纯色几何块拼成一个符号」的画法，
 * 并明确要求「不要一个颜色，看看什么配蓝色最高级」。
 *
 * 配色（C-V-03 原文「蓝色**或**靛蓝色作为品牌强调色」）：
 *   第二色取**靛蓝** `--brand-indigo`（#4a55e6）——同属冷色，和品牌蓝 #188df9
 *   明度差够、色相差一点点，并排看得出是两色，但不会像紫/绿那样把注意力从蓝上抢走。
 *   橙、绿、紫依旧禁止（C-S-03），所以没有走参考图的紫+绿。
 *
 * 形态原则：只保留能认出「叠三层 / 转一圈 / 一张牌」的最少几何，不做细节、不加阴影，
 * 靠形状与两色对比说话；卡片本身守 C-V-07（1px 浅边框，不叠阴影发光）。
 */

const STEPS = [
  {
    no: '01',
    label: '上游采购价',
    icon: <StrataIcon />,
    points: ['按企业量级与上游谈，用量越大单价越低', '同一模型可能有多条线路，取稳定的那条'],
  },
  {
    no: '02',
    label: '平台加价层',
    icon: <ArcIcon />,
    points: ['在采购价上加一层固定服务费', '用于网关、计费、对账与技术支持'],
  },
  {
    no: '03',
    label: '你看到的单价',
    icon: <CardIcon />,
    points: ['页面价与账单同价，按调用时价格结算', '调价不回溯旧账'],
  },
];

export function PriceLogic() {
  return (
    <section className="relative overflow-hidden border-b border-line py-20 md:py-28">
      <div className="relative mx-auto w-full max-w-[1280px] px-6">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
          <div>
            <SectionEyebrow>价格口径</SectionEyebrow>
            <h2
              className="mt-4 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.2 }}
            >
              这个价格是怎么做到的？
            </h2>
          </div>
          <p className="text-note leading-relaxed text-ink-mid md:pb-1.5">
            一个账户，一张账单。价格从采购价往下算，平台只收中间一层。
          </p>
        </div>

        {/* 三步流程：抽象图标居中 → 步骤号 + 标题 → 要点列表 */}
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.label}
              className="group relative flex flex-col items-center rounded-none border border-line bg-white px-6 pb-8 pt-10 text-center transition-colors duration-300 hover:border-brand-300"
            >
              <span className="text-brand-500 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
                {step.icon}
              </span>

              <div className="mt-6 flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-brand-700">
                  {step.no}
                </span>
                <h3 className="text-note font-semibold text-ink">{step.label}</h3>
              </div>

              <ul className="mt-4 space-y-2 text-left">
                {step.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-meta leading-relaxed text-ink-mid">
                    <span
                      aria-hidden
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-500"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-[18px] top-1/2 hidden -translate-y-1/2 text-brand-300 md:block"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 8h10M9 5l4 3-4 3" />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-8 border-t border-line pt-4 text-meta text-ink-muted">
          单价以后端计费规则为准；本页为口径说明，不构成报价。
        </p>
      </div>
    </section>
  );
}

/* ─── 抽象图标：只用纯色几何块，蓝色打底 + 靛蓝点睛 ─────────────────────
 *
 * 三块共用 64 单位网格与 80px 显示尺寸，所以视觉重量一致。
 * 颜色全部取 token（`var(--color-brand-*)`），业务代码零裸 hex（C-S-02）。
 */

function StrataIcon() {
  return (
    <svg width="88" height="88" viewBox="0 0 64 64" fill="none" aria-hidden>
      {/* 两层同宽错位的圆角条：读作「采购价 → 加一层」的叠片 */}
      <g transform="rotate(-16 32 32)">
        <rect x="11" y="17" width="42" height="13" rx="6.5" fill="var(--color-brand-indigo)" />
        <rect x="11" y="34" width="42" height="13" rx="6.5" fill="var(--color-brand-500)" />
      </g>
      {/* 点睛：一颗亮蓝点，打破对称 */}
      <circle cx="49" cy="15.5" r="4.5" fill="var(--color-brand-400)" />
    </svg>
  );
}

function ArcIcon() {
  return (
    <svg width="88" height="88" viewBox="0 0 64 64" fill="none" aria-hidden>
      {/* 一圈留缺口的弧：读作「在基础价上加一层」 */}
      <circle
        cx="32"
        cy="32"
        r="18"
        stroke="var(--color-brand-500)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="74 40"
        transform="rotate(-90 32 32)"
      />
      {/* 点睛：靛蓝实心核，也是「加价层」本体 */}
      <circle cx="32" cy="32" r="8" fill="var(--color-brand-indigo)" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="88" height="88" viewBox="0 0 64 64" fill="none" aria-hidden>
      <g transform="rotate(-12 32 32)">
        {/* 一块靛蓝牌面 + 一条蓝色斜切，读作「吊牌上的价」 */}
        <rect x="12" y="12" width="40" height="40" rx="13" fill="var(--color-brand-indigo)" />
        <path
          d="M12 33h40v6a13 13 0 0 1-13 13H25a13 13 0 0 1-13-13v-6Z"
          fill="var(--color-brand-500)"
        />
      </g>
      {/* 点睛：牌眼，暗示「挂出去的价格」 */}
      <circle cx="45.5" cy="18.5" r="4" fill="var(--color-brand-300)" />
    </svg>
  );
}
