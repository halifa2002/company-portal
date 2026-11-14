'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * 首屏大标题（v9.1，2026-11-14：换文案 + 关键词高亮）
 *
 * 上一版的文案是「三个协议，一个地址，一份账单」——三句排比念起来像参数表，
 * 说的是**我们有什么功能**，没说**这是个什么东西**。正式版那两句（专用于生产环境的
 * 统一大模型网关 / Agent 接入大模型的统一入口）好在定位清楚，但那是正式版的句子，
 * 预览页不能照抄，所以按同样的意思重写：
 *
 *   A：一个网关，接通 27 个模型      ← 对应「统一大模型网关」，落点在我们的真实数量
 *   B：一套接入，编程助手与业务通用  ← 对应「Agent 接入的统一入口」，落点在两种用户
 *
 * 高亮规则（延续正式版的经验）：
 *   - **高亮词固定在第一句的开头四个字**，两句交替时眼睛不用来回找位置；
 *   - 高亮只上色（brand-700），**不加 inline-block、不加 transform**——
 *     中文大标题塞 inline-block 节点会叠字/散架，这个坑 11-13 已经踩过两次；
 *   - 颜色用 brand-700 而不是 brand-600：首屏底色是淡蓝，brand-600(#188df9)
 *     压上去只有 3.0:1，只能算「大字号勉强过」，brand-700 是 4.7:1，正常字号也够。
 *
 * 动效不变：整句淡出 240ms → 换句 → 淡入；「减少动画」时不轮换、不淡入。
 */

const HOLD = 9000;
const FADE = 240;

type Frame = {
  /** 高亮词，两句都放在开头，长度尽量一致 */
  accent: string;
  /** 高亮词后面的部分 */
  tail: string;
};

export function V8HeroHeadline({ modelCount }: { modelCount: number }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [entered, setEntered] = useState(!reduced);

  const frames: Frame[] = [
    { accent: '一个网关', tail: `，接通 ${modelCount} 个模型` },
    { accent: '一套接入', tail: '，编程助手与业务通用' },
  ];

  // 首帧进场：一次性淡入
  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setEntered(true), 30);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  // 轮换：先淡出，再换句，再淡入
  useEffect(() => {
    if (reduced) return;
    const out = window.setTimeout(() => setVisible(false), HOLD);
    const swap = window.setTimeout(() => {
      setIndex((current) => (current + 1) % 2);
      setVisible(true);
    }, HOLD + FADE);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(swap);
    };
  }, [reduced, index]);

  const frame = frames[index];

  return (
    <h1
      aria-live="off"
      className="mx-auto mt-7 max-w-[16em] break-words text-center font-display font-semibold tracking-[-0.02em] text-ink transition-[opacity,transform] ease-out"
      style={{
        fontSize: 'clamp(30px, 5.4vw, 72px)',
        lineHeight: 1.08,
        transitionDuration: `${FADE}ms`,
        opacity: entered && visible ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(10px)',
      }}
    >
      <span className="text-brand-700">{frame.accent}</span>
      {frame.tail}
    </h1>
  );
}
