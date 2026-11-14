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
import { useId } from 'react';
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
function CircuitMotif({ flip = false }: { flip?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const fadeId = `circuit-fade-${uid}`;
  const maskId = `circuit-mask-${uid}`;

  return (
    <svg
      aria-hidden='true'
      className={`pointer-events-none absolute bottom-0 h-56 w-56 ${
        flip ? '-left-4 scale-x-[-1]' : '-right-4'
      }`}
      viewBox='0 0 220 220'
      fill='none'
    >
      <defs>
        <linearGradient
          id={fadeId}
          x1='220'
          y1='220'
          x2='30'
          y2='30'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0%' stopColor='#fff' stopOpacity='1' />
          <stop offset='55%' stopColor='#fff' stopOpacity='0.5' />
          <stop offset='100%' stopColor='#fff' stopOpacity='0' />
        </linearGradient>
        <mask id={maskId}>
          <rect width='220' height='220' fill={`url(#${fadeId})`} />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`} strokeWidth='1.3' strokeLinecap='round'>
        <g stroke='#38b1ff'>
          {/* 右侧主干 */}
          <path d='M204 20 V204' />
          {/* 主干向左的分叉 */}
          <path d='M204 58 H158 a12 12 0 0 1 -12 -12 V22' />
          <path d='M204 100 H140 a12 12 0 0 1 -12 -12 V74' />
          <path d='M204 146 H170 a12 12 0 0 1 -12 -12 v-6 a12 12 0 0 0 -12 -12 h-12' />
          {/* 成组的嵌套矩形（硅基流动那种「模块」感） */}
          <rect x='104' y='96' width='60' height='48' rx='10' />
          <rect x='80' y='152' width='82' height='48' rx='10' />
          <rect x='44' y='40' width='76' height='48' rx='10' />
        </g>
        <g stroke='#10b981'>
          {/* 绿色支线，底部收口 */}
          <path d='M204 182 H126 a12 12 0 0 1 -12 -12 v-10' />
          <path d='M124 64 V26' />
          <rect x='148' y='58' width='28' height='24' rx='6' />
        </g>
      </g>
    </svg>
  );
}

/**
 * 白卡的装饰：四张卡各一种纹样（不同形状，避免同图案重复出现）。
 * 统一规格：右下角、96px、品牌浅蓝细线、纯装饰（aria-hidden + pointer-events-none）。
 */
/**
 * 白卡的装饰：四张卡各一种**实心浅色块**（不是细线，细线在小尺寸下像划痕）。
 * 统一规格：右下角出血、152px、品牌浅蓝 #e3f3ff、纯装饰。
 */
function CardMotif({ variant }: { variant: number }) {
  const cls =
    'pointer-events-none absolute -right-6 -bottom-8 h-[152px] w-[152px] text-brand-100';

  if (variant === 0) {
    // 三层横条 —— 对应「稳定性」
    return (
      <svg aria-hidden='true' className={cls} viewBox='0 0 152 152' fill='currentColor'>
        <rect x='18' y='34' width='116' height='18' rx='6' opacity='0.9' />
        <rect x='18' y='64' width='116' height='18' rx='6' opacity='0.65' />
        <rect x='18' y='94' width='116' height='18' rx='6' opacity='0.4' />
      </svg>
    );
  }
  if (variant === 1) {
    // 三个圆点 + 粗连线 —— 对应「智能」
    return (
      <svg aria-hidden='true' className={cls} viewBox='0 0 152 152' fill='currentColor'>
        <path
          d='M40 110 L76 62 L112 110'
          stroke='currentColor'
          strokeWidth='10'
          fill='none'
          strokeLinecap='round'
          opacity='0.45'
        />
        <circle cx='40' cy='110' r='14' opacity='0.9' />
        <circle cx='76' cy='62' r='14' opacity='0.9' />
        <circle cx='112' cy='110' r='14' opacity='0.9' />
      </svg>
    );
  }
  if (variant === 2) {
    // 方中挖方 —— 对应「安全性」
    return (
      <svg aria-hidden='true' className={cls} viewBox='0 0 152 152' fill='currentColor'>
        <path
          fillRule='evenodd'
          d='M28 28h96v96H28V28zm28 28v40h40V56H56z'
          opacity='0.75'
        />
      </svg>
    );
  }
  // 两个叠加方块 —— 对应「扩展性」
  return (
    <svg aria-hidden='true' className={cls} viewBox='0 0 152 152' fill='currentColor'>
      <rect x='54' y='22' width='76' height='76' rx='10' opacity='0.45' />
      <rect x='22' y='54' width='76' height='76' rx='10' opacity='0.85' />
    </svg>
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
              <CircuitMotif flip={index === 1} />
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














