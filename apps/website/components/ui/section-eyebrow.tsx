/**
 * 区块小标题（eyebrow）构件（2026-11-14）
 *
 * 为什么抽出来：全站九个区块各写了一遍这段结构，短线的颜色出现了三种
 * （bg-brand-300 / bg-ink/25 / bg-brand-300/50）、字距出现两种（0.24em / 0.28em）。
 * 单看每一屏都还行，连着往下滚就能看出「这块和那块不是一个人做的」。
 *
 * 统一后：
 *   - 短线统一 32px、浅色区用品牌 300、深色区用品牌 300 + 50% 透明
 *   - 字距统一 0.24em
 *   - 文字色：浅色区 ink-muted（已过 4.5:1），深色区 brand-300
 *
 * 用法：
 *   <SectionEyebrow>平台能力</SectionEyebrow>
 *   <SectionEyebrow tone="dark">接入流程</SectionEyebrow>
 */

type Tone = 'light' | 'dark';

export function SectionEyebrow(props: {
  children: React.ReactNode;
  /** 深色区用 dark：短线与文字都换成深底上的对色 */
  tone?: Tone;
}) {
  const tone = props.tone ?? 'light';
  const lineClass = tone === 'dark' ? 'bg-brand-300/50' : 'bg-brand-300';
  const textClass = tone === 'dark' ? 'text-brand-300' : 'text-ink-muted';

  return (
    <div
      className={`flex items-center gap-3 text-meta font-medium uppercase tracking-[0.24em] ${textClass}`}
    >
      <span aria-hidden className={`h-px w-8 ${lineClass}`} />
      {props.children}
    </div>
  );
}
