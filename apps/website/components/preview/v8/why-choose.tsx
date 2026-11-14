/**
 * 「为什么选择虫洞 AI」——插在「模型与价格」广告栏之前的一屏。
 *
 * 2026-11-14 用户要求：参照硅基流动首页的「为什么选择硅基流动」一屏，
 * 在这条广告栏前面加一个独立栏目，**字要大**，文案借它那四张卡的骨架
 * （高稳定性 / 高智能 / 高安全性 / 高扩展性）。
 *
 * 两条自己的规矩（沿用本项目既有纪律）：
 *   ① 不编数字。硅基流动那边写的是「延迟降低 70%」「吞吐提升 3-5 倍」，
 *      那些是它自研推理引擎的实测；我们没有对应数据，就不摆数字，
 *      改成「机制描述」——说清我们到底怎么做到，而不是喊一个百分比。
 *   ② 不承诺没做的事。BYOK、计算隔离这类是实现方式，没落地的不写成卖点；
 *      这里只写已经能验证的能力（统一网关、三协议、按量计费、Key 隔离）。
 */

import { Blocks, BrainCircuit, ShieldCheck, Waves } from 'lucide-react';

import { SectionEyebrow } from '@/components/ui/section-eyebrow';

/** 四张卡：icon 用 lucide 线性，22px / 1.6 描边，与平台能力那屏一致 */
const PILLARS = [
  {
    icon: <Waves size={22} strokeWidth={1.6} aria-hidden="true" />,
    title: '高稳定性',
    points: [
      '统一网关背后可挂多条上游线路，某条线路出错时自动换下一条重试。',
      '每个 Key 单独设额度与可用模型，一个应用超支不影响其他应用。',
      '调用成功率、额度消耗、渠道健康都能在控制台看到，异常不用靠猜。',
    ],
  },
  {
    icon: <BrainCircuit size={22} strokeWidth={1.6} aria-hidden="true" />,
    title: '高智能',
    points: [
      '对话、推理、编程、多模态模型统一接入，厂商上新后台接上即可用。',
      '换模型只改请求里的 model 字段，SDK、鉴权与调用方式都不用动。',
      'OpenAI / Claude / Gemini 三套协议共用同一个地址，客户端不必分别适配。',
    ],
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.6} aria-hidden="true" />,
    title: '高安全性',
    points: [
      '整套服务可以部署在自有服务器上，请求与数据不经过第三方。',
      'Key 支持模型白名单、额度上限与来源 IP 限制，权限收到应用级。',
      '管理后台可只对办公网开放，公网入口与内部管理分开。',
    ],
  },
  {
    icon: <Blocks size={22} strokeWidth={1.6} aria-hidden="true" />,
    title: '高扩展性',
    points: [
      '新增模型只改后台渠道配置，官网模型页与价格表自动跟着更新。',
      '基于开源网关，可跟随官方版本升级，也能按需做私有化改造。',
      '官网、控制台与后台分仓维护，界面调整不影响底层计费与鉴权。',
    ],
  },
];

export function WhyChoose() {
  return (
    <section className='border-b border-line py-16 md:py-24'>
      <div className='mx-auto max-w-[1280px] px-6'>
        {/* 标题区：字号是本屏的主角，按用户要求「字要大」 */}
        <div className='max-w-[820px]'>
          <SectionEyebrow>为什么选择虫洞 AI</SectionEyebrow>
          <h2 className='mt-4 text-[36px] leading-[1.15] font-semibold tracking-tight text-ink sm:text-[52px]'>
            一个 Key，接得住业务，
            <br className='hidden sm:block' />
            也接得住账单
          </h2>
          <p className='mt-5 max-w-[640px] text-lg leading-relaxed text-ink-mid'>
            把多家的模型收到一个地址后面，接入方式只有一套；用量、额度与扣费都记在同一处，
            出了问题能追到具体请求。
          </p>
        </div>

        {/* 两张主卡：一张深色收口，一张浅色展开 */}
        <div className='mt-10 grid gap-4 md:grid-cols-2'>
          <div className='rounded-2xl bg-[#0b1b2b] p-8 text-white sm:p-10'>
            <p className='text-note font-semibold text-brand-300'>一套地址</p>
            <p className='mt-3 text-[28px] leading-snug font-semibold tracking-tight sm:text-[34px]'>
              三种协议
              <br />
              共用同一个 base_url
            </p>
            <p className='mt-4 text-body leading-relaxed text-white/70'>
              OpenAI 的 SDK、Claude 的客户端、Gemini 的调用方式，换过来只需要替换地址与密钥；
              不用为每家的协议各写一套适配代码。
            </p>
          </div>

          <div className='rounded-2xl border border-line bg-surface p-8 sm:p-10'>
            <p className='text-note font-semibold text-brand'>按量计费</p>
            <p className='mt-3 text-[28px] leading-snug font-semibold tracking-tight text-ink sm:text-[34px]'>
              用多少算多少
              <br />
              不囤额度、不设起步价
            </p>
            <p className='mt-4 text-body leading-relaxed text-ink-mid'>
              单价直接读后台计费配置生成，与账单一致；每一次调用消耗多少 Token、扣多少额度，
              都能在消费明细里对上。
            </p>
          </div>
        </div>

        {/* 四张卡：稳定性 / 智能 / 安全 / 扩展 */}
        <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className='rounded-2xl border border-line bg-surface p-6'
            >
              <div className='flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand'>
                {pillar.icon}
              </div>
              <h3 className='mt-4 text-[22px] font-semibold tracking-tight text-ink'>
                {pillar.title}
              </h3>
              <ul className='mt-4 space-y-2.5'>
                {pillar.points.map((point) => (
                  <li key={point} className='flex gap-2 text-meta leading-relaxed text-ink-mid'>
                    <span
                      aria-hidden='true'
                      className='mt-[7px] size-1 shrink-0 rounded-full bg-brand/50'
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
