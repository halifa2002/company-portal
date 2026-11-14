import Link from 'next/link';
import { registerUrl } from '@/lib/brand';
import { Arrow } from '@/components/ui/arrow';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

/**
 * 两种接入方式（2026-11-14 新增）。
 *
 * 参考 agtcloud.cn 的「两种接入方式」：一个问题拆成两条路径——
 * 开发者要的是「快」，企业要的是「稳、可治理」。这个分区让页面显得更专业，
 * 也回答了「你们到底服务谁」这个必答题。
 *
 * 不做：不编企业客户案例、不编 SLA 数字（我们没有真实数据）。
 * 只讲机制上平台实际提供的能力。
 */

const PATHS = [
  {
    tag: 'Developer',
    title: '开发者平台',
    desc: '注册即用，一个 Key 调全部模型。',
    points: [
      '统一鉴权与请求格式',
      '文本、图像、视频等多模态能力',
      '清晰的用量与错误反馈',
    ],
    cta: { label: '查看开发文档', href: '/docs/quickstart' },
    variant: 'primary' as const,
  },
  {
    tag: 'Enterprise',
    title: '企业服务',
    desc: '围绕组织权限、成本控制与交付要求的企业方案。',
    points: [
      '多成员权限与密钥生命周期管理',
      '调用治理与成本分析',
      '专属技术与交付支持',
    ],
    cta: { label: '联系我们', href: '/partner' },
    variant: 'secondary' as const,
  },
];

export function TwoPaths() {
  return (
    <section className="relative border-b border-line bg-white py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
        {/* 标题区 */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
          <div>
            <SectionEyebrow>两种接入方式</SectionEyebrow>
            <h2
              className="mt-4 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.2 }}
            >
              为不同规模的 AI 团队而建
            </h2>
          </div>
          <p className="text-note leading-relaxed text-ink-mid md:pb-1.5">
            从快速 API 接入到企业级治理，用同一个平台连接主流模型能力。
          </p>
        </div>

        {/* 双栏 */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {PATHS.map((path) => (
            <div
              key={path.title}
              className={[
                /*
                 * 边框（2026-11-14 加深一档）：原来用 border-line（#dce8f0），
                 * 这两张卡是白底白卡，边框几乎看不见，卡像飘在页面上。
                 * 没有改成纯黑——全站 hairline 都是蓝灰一档，纯黑会让这一屏变表格；
                 * 也没新增 token，直接用 ink 的透明度（按钮那边本来就这么写）：
                 * 静止 ink/15（≈ #cfd9e4，看得见但不抢），hover 收到 ink/30。
                 */
                'group relative overflow-hidden rounded-none border border-ink/25 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-ink/45 hover:shadow-[0_18px_40px_-26px_rgba(6,34,63,0.35)]',
              ].join(' ')}
            >
              {/* 装饰光晕 */}
              <div
                aria-hidden
                className={[
                  'pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                  path.variant === 'primary' ? 'bg-brand-200/40' : 'bg-ink/5',
                ].join(' ')}
              />

              <div className="relative">
                {/* 标签
                 * 2026-11-14 修：这里原来只有 inline-block，实测盒宽被压到 32px（内容区 8px），
                 * 白字溢出到卡片上——截图里就是"蓝圈里两个字母 + 外面一串白字"。
                 * 我试过加 Tailwind 的 `w-fit`：类在 DOM 上，但计算宽度仍是 32px（该工具类没生效）；
                 * 而**行内样式** width: fit-content 实测能恢复成 100px。所以这里直接写行内样式，
                 * 不用 class 猜。根因（inline-block 在本页为何收缩成 8px）还没查清，先按可用方案兜住。
                 */}
                {/*
                 * 标签（2026-11-15 统一）：原来两块分别是品牌蓝实心与深海军蓝实心，
                 * 同一位置的同级标签出现两种色阶，等于给「开发者」暗中加了一级权重。
                 * 现在两块都是深海军蓝实心，分级交给下面的按钮（主/次）。
                 */}
                <span
                  className="inline-block whitespace-nowrap rounded-full bg-ink px-3 py-1 text-meta font-semibold uppercase tracking-wider text-white"
                  style={{ width: 'fit-content' }}
                >
                  {path.tag}
                </span>

                <h3 className="mt-5 text-heading font-bold tracking-tight text-ink">
                  {path.title}
                </h3>
                <p className="mt-2 text-note leading-relaxed text-ink-mid">{path.desc}</p>

                {/* 能力清单 */}
                <ul className="mt-6 space-y-3">
                  {path.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-note text-ink-mid">
                      <span
                        className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6l3 3 5-6" />
                        </svg>
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={path.cta.href}
                  className={[
                    'mt-8 inline-flex h-11 items-center gap-2 rounded-none px-5 text-note font-medium transition-all',
                    path.variant === 'primary'
                      ? 'bg-ink text-white hover:bg-ink/85'
                      : 'border border-ink/20 text-ink hover:border-ink/45',
                  ].join(' ')}
                >
                  {path.cta.label}
                  <Arrow />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

