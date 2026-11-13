'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { HeroHeadline } from './hero-headline';
import { registerUrl } from '@/lib/brand';

/**
 * 首屏（2026-11-13 第十二版，只挂 /preview/home）
 *
 * 这一版回到**居中**，并且把背景颜色做足——照 fireworks.ai 的顶部：
 *
 *   fireworks 的首屏 = 白到橙的大渐变 + 底部半调网点 + 居中的大标题 + 两个按钮 + 一排客户 logo
 *   我们这一版     = 白到蓝的大渐变 + 底部半调网点 + 居中的大标题 + 两个按钮
 *
 * 2026-11-13 去掉了底部那排厂牌（原 VENDORS）。理由：
 * 参考站那排放的是**客户**（MongoDB / Notion / Vercel），作用是社会证明；
 * 我们那排放的是**上游模型厂商**（DeepSeek / 智谱 / Kimi），讲的是「卖什么」不是「谁在买」，
 * 而且下一段价格表用厂商 logo 加单价把同一批名字又讲了一遍——同一件事说了两遍。
 * 落在那个位置还容易被读成「我们和这些公司有合作」，这是减分不是加分。
 * 以后有了真客户再放，那时这一格才名副其实。
 *
 * 前几版一直不敢上色（怕违反「浅底」），结果渐变淡到看不见，
 * 整屏就是一张白纸加几个字——这才是「拉垮」的真正原因。
 * 领导要的是浅底深字，不是白色。浅蓝到 #c9e4ff 仍然是浅色底。
 *
 * 左对齐那套收起来了：中文标题短，左对齐之后右边永远空一大块，
 * 而且和下面几段居中排的版式对不上。参考站的居中是有道理的。
 */

export function HeroNext({ preview = false }: { preview?: boolean }) {
  const reduced = useReducedMotion();

  const fade = (delay: number, y = 14) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="relative flex min-h-[min(calc(100svh-65px),860px)] flex-col overflow-hidden">
      <div aria-hidden className="pv-hero-bg" />
      <div aria-hidden className="pv-hero-dots" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-16 text-center">
        <motion.div {...fade(0)} className="flex items-center gap-2.5">
          <span aria-hidden className="h-1 w-1 rounded-full bg-[#0a74e0]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d90a6]">
            Unified API Gateway
          </span>
        </motion.div>

        <div className="mt-8">
          <HeroHeadline />
        </div>

        <motion.p {...fade(0.12)} className="mx-auto mt-7 max-w-[34em] text-[15px] leading-[1.9] text-[#3f566f]">
          兼容 OpenAI 接口。换掉地址和密钥，其余代码不用动。
        </motion.p>

        {/* 主次靠「一个有框、一个没框」分开，不是靠两个框长得不一样 */}
        <motion.div {...fade(0.18)} className="mt-9 flex flex-wrap items-center justify-center gap-[18px]">
          {/*
            抄的是参考站的**运动方式**，不是它的样子：
            按钮里有一块白色小方片（knob），平时停在最左边装着钥匙；
            hover 时这块方片滑到最右边、背景变透明、钥匙变白，
            同时左右 padding 互换，文字跟着让位。整块宽度不变，像拨了一下开关。
          */}
          <Link href={registerUrl} className="pv-btn pv-btn--key">
            <span aria-hidden className="pv-knob">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="8" r="4.2" />
                <path d="M11.2 11.2 20 20" />
                <path d="M17 17l2.2-2.2" />
                <path d="M14.6 14.6l2.2-2.2" />
              </svg>
            </span>
            <span className="pv-btn-label">开始使用</span>
          </Link>
          <Link href={preview ? '/partner' : '/docs'} className="pv-text-link">
            企业方案
            <span aria-hidden className="pv-arrow">
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
