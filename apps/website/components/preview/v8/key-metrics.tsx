import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { CountUp } from './motion';

/**
 * 关键指标展示区（2026-11-14 改版：大数字卡片 + 滚动计数）
 *
 * 上一版是四条竖线分隔的扁平数字，信息对、但没有"分量"。参考站（agtcloud 那一屏）
 * 的做法值得学：
 *   - 每张卡是一个**独立的浅色卡片**（细微渐变 + 描边），不是靠在一条线上；
 *   - 数字放到 56px 以上，是全屏最大的东西；
 *   - 卡顶上有一行小标签（中文 + 英文全大写），给"仪表盘"的感觉；
 *   - 数字**滚进视口时从 0 数到目标值**，一次性，不循环。
 *
 * 我们照抄结构、不抄它的话术：它写"1 折 / 2000+ 供应商"，这些数字我们没有。
 * 四个指标仍然只用真实可核对的那四个（99.9% / <100ms / 24-7 / 100%）。
 *
 * 动画纪律（延续全站）：只做一次、800ms 缓出、尊重 prefers-reduced-motion；
 * 不循环、不弹跳、不视差。
 */

type Metric = {
  value: number | null;
  /** 前缀，例如 "<" */
  prefix?: string;
  /** 后缀，例如 "%" / "ms" */
  suffix?: string;
  /** 小数位；99.9 需要 1 位 */
  decimals?: number;
  /** 无法数字化的指标（如 24/7）原样显示 */
  staticText?: string;
  label: string;
  en: string;
  desc: string;
  /** 卡内色雾的落点，做出"每张卡光从不同方向来"的层次（只用品牌蓝族） */
  wash: string;
};

const METRICS: Metric[] = [
  {
    value: 99.9,
    decimals: 1,
    suffix: '%',
    label: '服务可用性',
    en: 'Uptime',
    wash: '38% 22%',
    desc: '基于过去 90 天的运行数据',
  },
  {
    value: 100,
    prefix: '<',
    suffix: 'ms',
    label: '平均响应延迟',
    en: 'Latency',
    wash: '72% 78%',
    desc: 'P95 延迟，不含上游模型处理时间',
  },
  {
    value: null,
    staticText: '24/7',
    label: '自动重试机制',
    en: 'Retry',
    wash: '22% 74%',
    desc: '调用失败自动切换备用线路',
  },
  {
    value: 100,
    suffix: '%',
    label: '价格透明',
    en: 'Transparency',
    wash: '80% 18%',
    desc: '所有费用可追溯到具体请求',
  },
];

export function KeyMetrics() {
  return (
    <section className="relative overflow-hidden border-b border-line py-14 md:py-20">
      {/* 背景细网格：52px 一格、5% 透明度、径向淡出（只做肌理，不做主角） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(6,34,63,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,34,63,0.05) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(72% 64% at 50% 34%, #000 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(72% 64% at 50% 34%, #000 0%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 md:px-10">
        {/*
         * 标题（2026-11-15 改回左对齐）：
         * 上一版照参考站做成居中眉题 + 居中标题，但这页其余十一屏全是
         * 「左侧短横线 + 眉标 + 左对齐大标题 + 右侧一句说明」，
         * 只有这一屏居中，滚到这儿版面突然断一次。现在归队，与全站同一套骨架。
         */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
          <div>
            <SectionEyebrow>平台能力</SectionEyebrow>
            <h2
              className="mt-4 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.2 }}
            >
              生产级的可靠性
            </h2>
          </div>
          <p className="text-note leading-relaxed text-ink-mid md:pb-1.5">
            不是玩具项目。从可用性到延迟，从重试机制到账单透明度，每个环节都按生产环境标准设计。
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className="group relative overflow-hidden rounded-none border border-ink/20 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_40px_-26px_rgba(6,34,63,0.35)] md:p-7"
            >
              {/* 卡内两层"质感"（2026-11-14 加，照参考站那种卡片底纹）：
               * ① 细网点：6px 一格的均匀点，透明度压得很淡，只在卡内做纸感；
               * ② 色雾：每张卡的落点不同（wash 坐标写在数据里），四张卡因此不是复制粘贴；
               *    只用品牌蓝族——橙是强调色禁区（C-V-03），暖调只允许出现在整屏背景雾里。
               */}
              {/* 沙粒像素层：3px 网格 + fractalNoise 颗粒，见 globals.css 的 .card-texture */}
              <span aria-hidden className="card-texture pointer-events-none absolute inset-0" />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(78% 66% at ${metric.wash}, rgba(6,34,63,0.07) 0%, rgba(255,255,255,0) 70%)`,
                }}
              />

              <div className="relative">
                {/* 卡顶小标签：中文 + 英文全大写，做出"仪表盘"的感觉 */}
                <div className="flex items-center gap-2 text-meta text-ink-muted">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  <span>{metric.label}</span>
                  <span aria-hidden className="text-ink-muted/40">·</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
                    {metric.en}
                  </span>
                </div>

                <div className="mt-7 font-mono text-[52px] font-bold leading-none tracking-[-0.03em] text-ink md:text-[56px]">
                  {metric.value === null ? (
                    metric.staticText
                  ) : (
                    <>
                      {metric.prefix}
                      <CountUp to={metric.value} decimals={metric.decimals} />
                      {metric.suffix}
                    </>
                  )}
                </div>

                <p className="mt-6 text-meta leading-relaxed text-ink-mid">{metric.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-none border border-line bg-surface-subtle p-6">
          <p className="text-meta leading-relaxed text-ink-mid">
            <span className="font-semibold text-ink">数据来源：</span>
            所有指标基于平台实际运行数据，可在控制台的「监控」页面查看实时状态。
            如有特殊 SLA 需求，请联系销售团队。
          </p>
        </div>
      </div>
    </section>
  );
}


