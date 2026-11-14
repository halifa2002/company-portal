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
      '多线路自动切换重试',
      'Key 单独设额度与模型',
      '成功率与渠道健康可视',
    ],
  },
  {
    icon: '/icons/why-intelligence.png',
    title: '高智能',
    points: [
      '对话推理编程统一接入',
      '换模型只改 model 字段',
      '三协议共用一套地址',
    ],
  },
  {
    icon: '/icons/why-security.png',
    title: '高安全性',
    points: [
      '可部署在自有服务器',
      'Key 白名单与额度上限',
      '后台仅对办公网开放',
    ],
  },
  {
    icon: '/icons/why-extensibility.png',
    title: '高扩展性',
    points: [
      '加模型只改后台配置',
      '跟随官方版本升级',
      '前后端分仓可改造',
    ],
  },
];

/**
 * 深色卡的装饰：电路纹样（主干分叉 + 成组嵌套圆角矩形 + 渐隐遮罩）。
 * 纯装饰 —— aria-hidden + pointer-events-none，不参与读屏与点击。
 * 第二张卡传 flip，整体镜像到左下角，避免两张卡长得一样。
 */
/**
 * 深色卡的背景纹理：每张卡各用一张生图底图，语言刻意不同 ——
 * ① 电路直角折线（why-circuit.jpg）：主 / 两条虚线
 * ② 点链同心波纹（why-ripple.jpg）：按量计费 / 流水感
 * 铺满 + 左侧压深渐变保证白字可读。两张卡不再共用一张图，避免镜像后仍显重复。
 */
const CARD_TEXTURES = ['/textures/why-circuit.jpg', '/textures/why-ripple.jpg'];

function CardTexture({ index }: { index: number }) {
  const src = CARD_TEXTURES[index % CARD_TEXTURES.length];
  // 深卡纹理不斜置（2026-11-15 用户澄清：斜着放是指下面四个符号，不是这两张卡）。
  // 第二张垂直翻转：一张纹理的密处落在右上、另一张落在右下，避免两张构图雷同。
  const transform = index === 1 ? 'scaleY(-1)' : undefined;
  return (
    <>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-cover bg-center opacity-90'
        style={{ backgroundImage: `url('${src}')`, transform }}
      />
      {/* 左侧压成实色保白字可读，向右放开让纹理显出来 */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/70 to-brand-950/10'
      />
    </>
  );
}
/**
 * 白卡的装饰：右下角一簇细线电路（2026-11-15 生图版，参照硅基流动那套 PCB 语言）。
 * 纯白底 + 单一浅蓝线（#7ccbff）、圆角直角走线、嵌套方框与焊盘阵列，整体微微倾斜。
 * 卡片底是纯白 #ffffff，白底用 mix-blend-multiply 直接消失，不用抠图。
 * 四张各一种构图：阶梯走线 / 芯片群 / 互锁方框 / 长带延伸。
 */
const MOTIF_IMAGES = [
  '/textures/why-sq-1.png',
  '/textures/why-sq-2.png',
  '/textures/why-sq-3.png',
  '/textures/why-sq-4.png',
];

function CardMotif({ variant }: { variant: number }) {
  return (
    <img
      src={MOTIF_IMAGES[variant % MOTIF_IMAGES.length]}
      alt=''
      aria-hidden='true'
      width={210}
      height={210}
      className='pointer-events-none absolute -right-5 -bottom-7 size-[138px] opacity-75 mix-blend-multiply select-none'
    />
  );
}
export function WhyChoose() {
  return (
    <section id='why-choose' className='border-b border-line py-16 md:py-24'>
      <div className='mx-auto max-w-[1280px] px-6'>
        <h2 className='text-center text-[44px] leading-tight font-semibold tracking-tight text-ink sm:text-[68px]'>
          为什么选择虫洞 AI
        </h2>

        {/* 上方两张深色大卡：标题 / 说明 / 按钮 + 右下角电路纹装饰 */}
        <div className='mt-12 grid gap-4 md:grid-cols-2'>
          {HEADLINERS.map((item, index) => (
            <div
              key={item.title}
              className='relative flex flex-col justify-between overflow-hidden bg-brand-950 p-8 sm:p-10'
            >
              <CardTexture index={index} />
              <div className='relative'>
                <h3 className='text-[30px] leading-snug font-semibold tracking-tight text-white sm:text-[36px]'>
                  {item.title}
                </h3>
                <p className='mt-4 text-[17px] leading-relaxed text-white/75'>
                  {item.desc}
                </p>
              </div>
              <Link
                href={item.href}
                className='group relative mt-8 inline-flex h-11 w-fit items-center gap-1.5 bg-white px-5 text-note font-medium text-ink transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300'
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
          {PILLARS.map((pillar, index) => (
            <div
              key={pillar.title}
              className='relative overflow-hidden border border-ink bg-surface p-6 sm:p-7'
            >
              <CardMotif variant={index} />
              <div className='relative flex justify-center'>
                <img
                  src={pillar.icon}
                  alt=''
                  width={104}
                  height={104}
                  className='size-[104px] object-contain'
                />
              </div>
              <h3 className='relative mt-4 text-center text-[26px] font-semibold tracking-tight text-ink'>
                {pillar.title}
              </h3>
              <ul className='relative mt-4 space-y-2'>
                {pillar.points.map((point) => (
                  <li
                    key={point}
                    className='flex gap-2.5 text-[15px] leading-[1.75] text-ink-mid'
                  >
                    <span
                      aria-hidden='true'
                      className='mt-[9px] size-1 shrink-0 rounded-full bg-ink-muted/60'
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











