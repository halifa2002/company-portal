/**
 * 「为什么选择虫洞 AI」——插在「模型与价格」广告栏之前的一屏。
 *
 * 2026-11-14 用户口径演变：
 *   ① 参照硅基流动同类版块，位置放在价格广告栏之前，字要大；
 *   ② 先做过「大字标题 + 两主卡 + 四能力卡」，用户反馈「AI 味太浓」；
 *   ③ 最终口径：照着硅基流动那几屏的结构——上方两张浅底大卡（标题 / 说明 / 按钮），
 *      下方四张浅灰卡（图标 + 大标题 + 要点列表）。
 *
 * 保留本项目纪律：不编数字（不写「延迟降低 70%」这类没有实测的百分比），
 * 只讲机制与能验证的事实（协议名、地址、额度、明细可对账）。
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** 上方两张主卡：标题 + 说明 + 按钮（对应硅基流动那两张大卡的写法） */
const HEADLINERS = [
  {
    title: '三种协议，一个地址',
    desc: 'OpenAI、Claude、Gemini 三套调用方式共用同一个 base_url，换客户端只需替换地址与密钥，不用为每家协议各写一套适配。',
    href: '/docs',
    cta: '查看接入文档',
  },
  {
    title: '按量计费，账目可查',
    desc: '单价直接读后台计费配置生成，与账单同源；每次调用的 Token 消耗与扣费额度都落在消费明细里，可以逐笔对上。',
    href: '/pricing',
    cta: '查看价格',
  },
];

/** 下方四张卡：图标 + 大标题 + 要点（对应硅基流动「高稳定性 / 高智能 …」那排） */
const PILLARS = [
  {
    icon: '/icons/why-stability.png',
    title: '高稳定性',
    points: [
      '统一网关背后可挂多条上游线路，某条出错自动换下一条重试。',
      '每个 Key 单独设额度与可用模型，一个应用超支不影响其他应用。',
      '调用成功率、额度消耗、渠道健康都能在控制台看到。',
    ],
  },
  {
    icon: '/icons/why-intelligence.png',
    title: '高智能',
    points: [
      '对话、推理、编程、多模态模型统一接入，后台接上即可用。',
      '换模型只改请求里的 model 字段，SDK 与鉴权都不用动。',
      '三套协议共用一套地址，客户端不必分别适配。',
    ],
  },
  {
    icon: '/icons/why-security.png',
    title: '高安全性',
    points: [
      '整套服务可部署在自有服务器上，请求与数据不经过第三方。',
      'Key 支持模型白名单、额度上限与来源 IP 限制。',
      '管理后台可只对办公网开放，公网与管理入口分开。',
    ],
  },
  {
    icon: '/icons/why-extensibility.png',
    title: '高扩展性',
    points: [
      '新增模型只改后台渠道配置，官网模型页与价格表自动更新。',
      '基于开源网关，可跟随官方版本升级，也能私有化改造。',
      '官网、控制台与后台分仓维护，界面调整不影响计费与鉴权。',
    ],
  },
];

export function WhyChoose() {
  return (
    <section id='why-choose' className='border-b border-line py-16 md:py-24'>
      <div className='mx-auto max-w-[1280px] px-6'>
        <h2 className='text-center text-[40px] leading-tight font-semibold tracking-tight text-ink sm:text-[60px]'>
          为什么选择虫洞 AI
        </h2>

        {/* 上方两张浅底大卡：标题 / 说明 / 按钮 */}
        <div className='mt-12 grid gap-4 md:grid-cols-2'>
          {HEADLINERS.map((item) => (
            <div
              key={item.title}
              className='flex flex-col justify-between bg-brand-950 p-8 sm:p-10'
            >
              <div>
                <h3 className='text-[26px] leading-snug font-semibold tracking-tight text-white sm:text-[30px]'>
                  {item.title}
                </h3>
                <p className='mt-4 text-body leading-relaxed text-white/70'>
                  {item.desc}
                </p>
              </div>
              <Link
                href={item.href}
                className='group mt-8 inline-flex h-11 w-fit items-center gap-1.5 bg-white px-5 text-note font-medium text-ink transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300'
              >
                {item.cta}
                <ArrowRight
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden='true'
                  className='transition-transform group-hover:translate-x-0.5'
                />
              </Link>
            </div>
          ))}
        </div>

        {/* 下方四张卡：生图图标 + 大标题 + 要点（外框黑色细线，按用户 2026-11-15 要求） */}
        <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className='border border-ink bg-surface p-6 sm:p-7'>
              <div className='flex justify-center'>
                <img
                  src={pillar.icon}
                  alt=''
                  width={64}
                  height={64}
                  className='size-16 object-contain'
                />
              </div>
              <h3 className='mt-5 text-center text-[22px] font-semibold tracking-tight text-ink'>
                {pillar.title}
              </h3>
              <ul className='mt-5 space-y-3'>
                {pillar.points.map((point) => (
                  <li
                    key={point}
                    className='flex gap-2 text-meta leading-relaxed text-ink-mid'
                  >
                    <span
                      aria-hidden='true'
                      className='mt-[7px] size-1 shrink-0 rounded-full bg-ink-muted/50'
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





