import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { brand } from '@/lib/brand';

/**
 * 生态合作页。
 *
 * 参考站的合作计划是社区导向（代金券、周边、PR 贡献），我们没有那个基础，
 * 所以照结构不照内容：每类合作都写清「适用对象 / 合作方式 / 你能得到什么」，
 * 不写分成比例，也不承诺尚未确定的权益——政策定了再补。
 */
export const metadata = { title: '生态合作' };

const TRACKS = [
  {
    tag: '产品集成',
    title: '把模型能力嵌进你的产品',
    audience: 'SaaS 厂商、工具类产品、企业内部系统',
    approach: '通过统一 API 接入，模型选型与计费由平台承担，你只负责业务侧的产品体验。',
    gains: ['标准 OpenAI 兼容接口，接入成本低', '按调用量结算，前期不用压预算', '技术对接支持'],
  },
  {
    tag: '渠道分销',
    title: '区域与行业的分销合作',
    audience: '区域服务商、行业解决方案商',
    approach: '由伙伴负责客户拓展与本地交付，平台提供产品、计费与结算支撑。',
    gains: ['区域与行业授权', '伙伴价格体系', '售前与方案支持'],
  },
  {
    tag: '解决方案',
    title: '面向企业的定制交付',
    audience: '有明确 AI 落地需求的企业客户',
    approach: '从模型选型、接入实施到用量治理一并落地，交付可运维的接入方案。',
    gains: ['方案设计与选型建议', '接入实施', '用量与成本治理'],
  },
];

const STEPS = [
  { step: '01', title: '沟通场景', desc: '说明你的客户类型、使用场景和预期规模。' },
  { step: '02', title: '方案与报价', desc: '给出接入方式、结算方式与价格方案。' },
  { step: '03', title: '技术对接', desc: '开通账号、联调接口、跑通首个调用链路。' },
  { step: '04', title: '上线与结算', desc: '正式上线，按约定周期结算用量。' },
];

export default function PartnerPage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ─── Hero ─── */}
        <section
          className="relative overflow-hidden border-b border-line"
          style={{
            background:
              'var(--gradient-hero)',
          }}
        >
          <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:py-24">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-white/70 px-3.5 py-1 text-meta font-medium tracking-wide text-brand">
              PARTNER · 生态合作
            </span>

            <h1 className="mt-6 text-display font-bold leading-tight tracking-tight md:text-hero">
              <span className="text-ink">{brand.name} </span>
              <span
                style={{
                  background: 'var(--gradient-brand)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                生态共建计划
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-body leading-relaxed text-ink-mid md:text-title">
              依托统一的模型接入能力，和集成商、渠道伙伴、企业客户一起，
              把 AI 能力落到真实的业务场景里。
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${brand.email}?subject=%E7%94%9F%E6%80%81%E5%90%88%E4%BD%9C%E5%92%A8%E8%AF%A2`}
                className="inline-flex items-center gap-2 rounded-card px-8 py-3.5 text-body font-semibold text-white shadow-brand-lg transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: 'var(--gradient-primary)' }}
              >
                立即沟通
                <span aria-hidden>→</span>
              </a>
              <Link
                href="/docs"
                className="rounded-card border border-line bg-white px-7 py-3.5 text-body font-medium text-ink transition-colors hover:border-brand/30 hover:text-brand"
              >
                先看产品能力
              </Link>
            </div>

            <p className="mt-6 text-meta text-ink-muted">
              合作政策仍在制定中，具体权益以双方沟通结果为准
            </p>
          </div>
        </section>

        {/* ─── 合作模式 ─── */}
        <section className="border-b border-line bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-heading font-bold tracking-tight text-ink md:text-display">合作模式</h2>
            <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-mid">
              三类合作方向，按你的角色选最接近的一种先聊。
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {TRACKS.map((track) => (
                <article
                  key={track.tag}
                  className="flex flex-col rounded-panel border border-line bg-white p-6 transition-colors duration-300 hover:border-brand/25"
                >
                  <span className="whitespace-nowrap w-fit rounded border border-brand/20 bg-brand/5 px-2 py-0.5 text-meta font-medium text-brand">
                    {track.tag}
                  </span>
                  <h3 className="mt-3 text-title font-bold leading-snug text-ink">{track.title}</h3>

                  <dl className="mt-4 space-y-3 text-note leading-relaxed">
                    <div>
                      <dt className="text-ink-muted">适用对象</dt>
                      <dd className="mt-0.5 text-ink-soft">{track.audience}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">合作方式</dt>
                      <dd className="mt-0.5 text-ink-soft">{track.approach}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">你能得到</dt>
                      <dd className="mt-1">
                        <ul className="space-y-1.5">
                          {track.gains.map((gain) => (
                            <li key={gain} className="flex items-start gap-2 text-ink-soft">
                              <span
                                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand/60"
                                aria-hidden
                              />
                              {gain}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 合作流程 ─── */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-heading font-bold tracking-tight text-ink md:text-display">怎么开始</h2>
          <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-mid">
            四步走完，通常两周内可以跑通第一个场景。
          </p>

          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {STEPS.map((item) => (
              <li key={item.step} className="rounded-card border border-line bg-surface-tint-soft p-5">
                <span className="font-mono text-meta text-brand">{item.step}</span>
                <h3 className="mt-2 text-title font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-note leading-relaxed text-ink-mid">{item.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ─── 联系 ─── */}
        <section className="mx-auto max-w-4xl px-6 pb-20">
          <div className="rounded-panel bg-[var(--dark-surface)] px-8 py-12 text-center md:px-14">
            <h2 className="text-heading font-bold text-white">想先聊聊？</h2>
            <p className="mx-auto mt-3 max-w-xl text-body leading-relaxed text-white/60">
              把场景、客户类型和预期合作方式发给我们，政策明确后会优先联系。
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-body">
              <a
                href={`mailto:${brand.email}?subject=%E7%94%9F%E6%80%81%E5%90%88%E4%BD%9C%E5%92%A8%E8%AF%A2`}
                className="rounded-card bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/15"
              >
                {brand.email}
              </a>
            </div>
            <p className="mt-6 text-meta text-white/35">
              邮箱为占位地址，公司资料确定后替换
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
