'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ApiEndpoint } from './api-endpoint';
import { GatewayGraph } from './gateway-diagram';
import { HeroHeadline } from './hero-headline';
import { VendorLogo } from './vendor-logo';
import { registerUrl } from '@/lib/brand';

/**
 * 官网首屏（2026-11-13 第五版，只挂在 /preview/home）
 *
 * 第四版把首屏压到 716 高，屏幕上只剩半屏多一点，价格段直接露出来——
 * 第一眼看到的是"上面一点东西、下面马上开始正文"，像一页没排完的稿子。
 * 参考站的道理很简单：首屏必须自己占满一屏，把"这是什么"一次说完。
 *
 * 这一版就补这一件事，用的全是页面上本来就有的东西，不新增一句文案：
 *
 *   1. **撑满一屏**：section 至少一屏高（减掉导航），文字居中偏上，
 *      底下留出位置给图——留白从此是"呼吸"，不是"缺东西"。
 *   2. **把请求流向图搬上来**：这张图原来在下面深蓝段的最底部，
 *      要滚过一整屏才看得到；它本来就是解释"这是什么"的，属于首屏。
 *      搬上来以后深蓝段也自然短了一半。
 *   3. **厂牌墙留在最底下**：首屏收口那一条，不抢图。
 */

/** 底部厂牌墙：与 /models 的实际清单对齐，只写厂牌不写型号与价格 */
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
     * min-h 用 svh 而不是 vh：手机上 vh 会把地址栏算进去，首屏永远差一截。
     * 减掉 65 是导航（sticky）的高度，这样"首屏"落地时正好是一整屏。
     */
    <section className="pv-hero relative flex min-h-[calc(100svh-65px)] flex-col overflow-hidden">
      {/* 背景：中间一层淡蓝雾，只托标题，四角收回白 */}
      <div aria-hidden className="pv-wash" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-6 pb-8 pt-12 text-center md:px-8 md:pt-14">
        {/* 小标：胶囊 + 点，全站章节标都用这一个形状 */}
        <motion.div {...fade(0)} className="flex justify-center">
          <span className="pv-eyebrow">Unified API Gateway</span>
        </motion.div>

        {/*
          大标题交给 HeroHeadline（客户端组件）：它自己管「两句话轮换 + 逐字入场 + 渐变词」。
          这里不再套 motion.h1，否则外层淡入会和里面每字动画打架。
        */}
        <HeroHeadline />

        <motion.p
          {...fade(0.12)}
          className="mx-auto mt-7 max-w-[34em] text-balance text-title leading-[1.8] text-ink-mid"
        >
          兼容 OpenAI 接口。换掉地址和密钥，其余代码不用动。
        </motion.p>

        <motion.div {...fade(0.18)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href={registerUrl} className="pv-btn pv-btn--primary pv-btn--lg">
            开始使用
            <span aria-hidden className="text-[15px] leading-none">
              →
            </span>
          </Link>
          <Link href={preview ? '/partner' : '/docs'} className="pv-btn pv-btn--ghost pv-btn--lg">
            {preview ? '企业方案' : '查看文档'}
          </Link>
        </motion.div>

        {/* 接口地址条：能直接抄走的地址放在第一屏，不用翻文档 */}
        <motion.div {...fade(0.24)} className="mt-10 flex justify-center">
          <ApiEndpoint />
        </motion.div>
      </div>

      {/*
        请求流向图：左三路上游 → 中间网关 → 右边调用端。
        它是这一页唯一一张"平台自己在干什么"的实物图，
        比任何一句话都更能说明白，所以放首屏、放标题下面。
      */}
      <motion.div {...fade(0.3, 10)} className="relative z-10 mx-auto w-full max-w-[940px] px-6 pb-10 md:px-8">
        <GatewayGraph />
      </motion.div>

      {/*
        厂牌墙：一条整幅、上下细线的六格，压在首屏最下沿收口。
        每格「图标 + 名字」，竖线分隔，悬停整格提亮。
      */}
      <motion.div {...fade(0.36, 8)} className="relative z-10 border-y border-[#e3eaf2] bg-white/70">
        <div className="mx-auto w-full max-w-[1200px] px-6 md:px-8">
          <div className="grid grid-cols-2 divide-x divide-[#e3eaf2] sm:grid-cols-3 lg:grid-cols-6">
            {VENDORS.map((name) => (
              <div
                key={name}
                className="group flex items-center justify-center gap-2.5 py-5 transition-colors hover:bg-[#f8fbfe]"
              >
                {/*
                  厂牌去色：五家各有各的品牌色（蓝、黑、紫、红…），
                  一排彩标并排是首屏最花的地方。统一压成灰、hover 才复原——
                  这一行的作用是"说明接了谁"，不是展览别人的品牌色。
                */}
                <span className="opacity-95 grayscale brightness-[0.85] contrast-[1.15] transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100">
                  <VendorLogo vendor={name} size={19} />
                </span>
                <span className="whitespace-nowrap text-note font-medium text-ink-soft">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
