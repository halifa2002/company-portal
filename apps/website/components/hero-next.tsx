'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ApiEndpoint } from '@/components/api-endpoint';
import { HeroDots } from '@/components/hero-dots';
import { HeroHeadline } from '@/components/hero-headline';
import { VendorLogo } from '@/components/vendor-logo';
import { registerUrl } from '@/lib/brand';

/**
 * 官网首屏�?026-11-13 第二版，只挂�?/preview/home�? *
 * 版式直接对标 fireworks�?*居中五层**—�? * 小字标签 / 一行大标题 / 一句说�?/ 两个按钮 / 底部一条厂牌带�? * 中间大片留白，色带和网点压在最底部当背景�? *
 * 为什么从左右分栏改回居中�? * 上一版左边一块大字、右边一张拓扑图，两边都想当主角，视线学会了两处来回跳；
 * 而且拓扑图缩在右半边、字又小，看着像文档里的插图，撑不起首屏�? * 参考站的做法更简单也更有效：**只让一句话当主�?*，其余全部退到它下面�? * 拓扑图没有丢，它挪到下面「平台能力」那一段去讲，那里本来就该解释请求怎么走�? *
 * 配色守领导文�?7.1：浅底、深字、一个靛蓝强调色�? * 唯一上色的地方是标题里的「所有」——一个词就够把视线钉住�? *
 * 字体给了 A/B 开关（只在预览页出现）�? * 中文衬线在大字号下更像出版物，可能显贵、也可能不像技术产品，靠猜没意义�? */

/** 底部厂牌带：�?/models 的实际清单对齐，只写厂牌不写型号与价�?*/
const VENDORS = ['DeepSeek', '智谱 GLM', 'Kimi', '通义千问', 'MiniMax', '腾讯混元'];

export function HeroNext({ preview = false }: { preview?: boolean }) {
  const reduced = useReducedMotion();

  const fade = (delay: number, y = 14) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    /*
     * 首屏高度�?026-11-13 调整）：
     * 原来 min-h 直接顶满一屏，1326 高的屏上首屏 1252px、其中约 760 是空白，
     * 而且下面一块一点都露不出来——访客不知道还要往下滚�?     * 现在封顶 920：大屏上首屏收住，底部露出下一块的抬头�?350px�?     */
    <section className="relative flex min-h-[min(calc(100vh-4rem),920px)] flex-col overflow-hidden bg-white">
      {/* ---------- 背景：只剩一层极淡的柔光兜底 ---------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 44% at 50% 8%, rgba(226,238,248,0.55) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      {/* ---------- 文案 ---------- */}
      {/*
        色带是文档流里的一块（在下面），所以这里不用再留补偿的底部内边距�?        文案整体在色带上方居中，字全部落在白底上�?      */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-14 text-center md:pt-16">
        <motion.div
          {...fade(0)}
          className="flex items-center gap-2.5 text-meta font-medium uppercase tracking-[0.22em] text-ink-muted"
        >
          <span aria-hidden className="h-1 w-1 rounded-full bg-brand" />
          Unified API Gateway
        </motion.div>

        {/*
          大标题交�?HeroHeadline（客户端组件）：它自己管「两句话轮换 + 逐字入场 + 渐变词」�?          这里不再�?motion.h1，否则外层淡入会和里面每字动画打架�?        */}
        <HeroHeadline />

        <motion.p
          {...fade(0.12)}
          className="mx-auto mt-6 max-w-[560px] text-balance leading-[1.75] text-ink-mid"
          style={{ fontSize: 'clamp(15px, 1.05vw, 18px)' }}
        >
          兼容 OpenAI 接口。换掉地址和密钥，其余代码不用动。        </motion.p>

        <motion.div {...fade(0.18)} className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-4">
          {/*
            首屏主按钮（2026-11-13）：圆角胶囊 → 直角分块。
            左边一格白底只装箭头，右边一格深底装文字，中间不留缝、外面描一道边。
            这跟收尾段是同一套语言——全页只有这两处用直角，其余都是圆角，
            按钮因此成了"印刷品"，而不是又一个圆角控件。
          */}
          <Link
            href={registerUrl}
            className="group inline-flex h-[58px] items-stretch border border-[#06223f] transition-transform duration-200 active:translate-y-px"
          >
            <span className="flex w-[58px] items-center justify-center bg-white text-title text-ink transition-colors duration-200 group-hover:bg-brand-50">
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </span>
            <span className="flex items-center bg-[#06223f] px-7 text-title font-medium text-white transition-colors duration-200 group-hover:bg-[#0a3257]">
              开始使用
            </span>
          </Link>

          <Link
            href={preview ? '/partner' : '/docs'}
            className="inline-flex h-[58px] items-center border border-ink/20 bg-white/70 px-7 text-title font-medium text-ink backdrop-blur transition-colors hover:border-ink/45 hover:bg-white"
          >
            {preview ? '企业方案' : '查看文档'}
          </Link>
        </motion.div>

        {/*
          接口地址条：参考站把「能直接抄走的地址」放在首屏，
          访客不用翻文档就知道请求该发到哪。这条比厂牌带更该靠上，所以放这儿�?        */}
        <motion.div {...fade(0.24)} className="mt-8 w-full max-w-[600px]">
          <ApiEndpoint />
        </motion.div>
      </div>

      {/* ---------- 色带：占首屏约三成，压在文案下方、厂牌带上方的位�?---------- */}
      {/*
        高度 2026-11-13 再收一次：38vh �?1316 高的屏上顶到 440，占首屏三分之一还全是空的�?        改成 26vh / 上限 320——色带是"收尾的色�?，不是主角，够压住底边就行�?      */}
      <div className="relative z-10 h-[clamp(200px,26vh,320px)] w-full">
        <HeroDots />
      </div>

      {/* ---------- 底部：厂牌跑马灯 ---------- */}
      {/*
        这一条是纯白的：它是色带的「终止线」�?        半透明会让底下的靛蓝透上来，厂牌名压在淡紫上会发灰，不如干脆切干净�?      */}
      <motion.div {...fade(0.3, 8)} className="relative z-10 border-t border-line/70 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-6 px-6 py-5 2xl:px-10">
          <span className="shrink-0 text-meta uppercase tracking-[0.16em] text-ink-muted">已上架</span>
          {/*
            内容重复两份、走 -50%：无缝循环�?            两侧�?mask 渐隐，进出不留硬切口；悬停暂停，方便看清名字�?          */}
          <div className="marquee-mask min-w-0 flex-1 overflow-hidden">
            <div className="marquee-track flex w-max items-center gap-12 py-1">
              {[...VENDORS, ...VENDORS].map((name, index) => (
                <span
                  key={`${name}-${index}`}
                  /*
                   * 厂牌去色�?026-11-13）：五个厂牌各有各的品牌色（蓝、黑、紫、红…）�?                   * 一排彩标并排是首屏最花的地方。统一压成灰、hover 才复原—�?                   * 这一行的作用�?说明接了�?，不是展览别人的品牌色�?                   */
                  className="group flex items-center gap-2 whitespace-nowrap text-body font-medium text-ink-soft"
                >
                  {/*
                    灰度化的第二版（2026-11-13）：第一�?grayscale + opacity-70 出来是一层雾�?                    用户第一眼就�?怎么是灰白的"�?                    原因：灰色本身明度中等，再乘 70% 透明，对比度就掉到几乎看不见�?                    现在改「灰但不淡」：亮度压到 85、对比提�?115、不透明�?95�?                    底色仍是灰，图标轮廓立得住。hover 恢复品牌原色�?                  */}
                  <span className="opacity-95 grayscale brightness-[0.85] contrast-[1.15] transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100">
                    <VendorLogo vendor={name} size={20} />
                  </span>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 色带�?A/B 开关已删（2026-11-13 定稿「亮而不淡」那一档，色值在 hero-dots.tsx�?*/}
    </section>
  );
}