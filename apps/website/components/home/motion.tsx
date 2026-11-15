'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * v8 动效基元（2026-11-13 晚加；2026-11-14 修健壮性）
 *
 * 领导要「高级、不像业余搭的站」，同时要求「不要 AI 味」——这两条在动效上是统一的：
 * 高级的做法是**慢、轻、只做一次**（600–800ms 的缓出，位移不超过 16px，进场后静止）；
 * 廉价的做法是**快、弹、循环**（bounce、无限浮动、视差乱飞）。
 *
 * 所以这里只提供两个基元：
 *   Reveal —— 进入视口时淡入 + 上移一次，之后不再动；
 *   CountUp —— 数字从 0 数到目标值，一次性（首屏不数，见下）。
 * 两者都尊重 prefers-reduced-motion：开启「减少动画」时直接静态呈现。
 *
 * 2026-11-14 修的坑（会真的白屏）：上一版把「显示出内容的时机」完全交给
 * IntersectionObserver。一旦观察器回调没来（无头截图、某些嵌入式 WebView、
 * 或者元素在首屏且挂载瞬间静止），元素就永远停在 `opacity: 0`——
 * 内容其实在 DOM 里，只是看不见。首屏尤其致命。
 * 现在挂载时先量一次位置：**只要已经在视口里就直接显示**，只有真正在折叠线以下的
 * 才交给观察器。观察器仍然只触发一次，滚动出现的观感不变。
 */

export function Reveal(props: {
  children: React.ReactNode;
  /** 延迟毫秒，用来做同屏多元素的先后感 */
  delay?: number;
  /** 位移距离，默认 10px；同屏要克制，别超过 16 */
  y?: number;
  className?: string;
  /** 标签名：标题内部不能塞 div 的地方传 span，避免非法嵌套 */
  as?: 'div' | 'span' | 'li';
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    // 已经在视口里（首屏）→ 立刻显示，不等观察器
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '-12% 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  if (reduced) {
    const Tag = props.as ?? 'div';
    return (
      <Tag ref={ref as never} className={props.className}>
        {props.children}
      </Tag>
    );
  }

  const MotionTag = props.as === 'span' ? motion.span : props.as === 'li' ? motion.li : motion.div;

  return (
    <MotionTag
      ref={ref as never}
      className={props.className}
      initial={{ opacity: 0, y: props.y ?? 10 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: props.y ?? 10 }}
      transition={{ duration: 0.7, delay: (props.delay ?? 0) / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {props.children}
    </MotionTag>
  );
}

/**
 * 数字滚动。
 *
 * 2026-11-13 晚改：**首屏数字不数了**。
 * 之前从 0 开始数，服务端输出就是 0——关掉 JS、或者领导截图的那一瞬间，
 * 首屏会显示「0 种协议 / 0 个模型」，比不动画糟得多。
 * 现在的规则：初始即真实值；只有「滚到视口里时距页面加载已超过 400ms」的
 * （也就是首屏以下的数字）才从 0 数到目标值。首屏数字直接到位。
 */
export function CountUp(props: { to: number; duration?: number; decimals?: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(props.to);
  const mountedAt = useRef(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '-10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;
    // 首屏：观察器在加载后极短时间内就触发，这种不数，直接显示真值
    if (performance.now() - mountedAt.current < 400) return;

    const duration = props.duration ?? 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const raw = props.to * eased;
      setValue(
        props.decimals ? Number(raw.toFixed(props.decimals)) : Math.round(raw),
      );
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, props.to, props.duration, reduced]);

  const text =
    props.decimals && Number.isInteger(props.decimals)
      ? value.toFixed(props.decimals)
      : String(value);
  return (
    <span ref={ref} className="tabular-nums">
      {text}
    </span>
  );
}

