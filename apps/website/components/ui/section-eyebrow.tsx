/**
 * 区块小标题（eyebrow）构件（2026-11-14 定版 B+）
 *
 * 演进：
 *   ① 起初九处各写一遍，短线颜色三种、字距两种 → 抽成组件，统一「32px 蓝线 +
 *      12px 小字 + uppercase + tracking 0.24em」；
 *   ② 2026-11-14 对照 docs/design-playbook 第 9 条（"带小标 + 大标题"是 AI 生成页
 *      最稳定的特征，禁用大写 / 宽字距 / 圆角边框 / 前置小圆点）——原来那版正好
 *      把三样凑齐了：线、大写、0.24em 字距。中文本来不需要字距，拉这么开纯粹是模板相；
 *   ③ 本版（B+）：**去掉短线、去掉大写、去掉字距**，只留一行实字。
 *      12px→13px、字重 500→600、色阶 ink-muted→ink-soft，靠字号/字重/颜色压住标题，
 *      不靠加壳。理由：试过深色实心胶囊（像 DEVELOPER 那枚），单看一屏不错，但 12 屏
 *      连排会出现三个问题——眼睛先落在黑块上而不是标题、填充胶囊默认读作"能点"、
 *      并稀释"深色只用于段落收口"的规矩。
 *
 * 现在它就是一个 kicker：位置仍在标题上方，负责"这屏属于哪一章"。
 *
 * 用法：
 *   <SectionEyebrow>平台能力</SectionEyebrow>
 *   <SectionEyebrow tone="dark">接入流程</SectionEyebrow>
 */

type Tone = 'light' | 'dark';

export function SectionEyebrow(props: {
  children: React.ReactNode;
  /** 深色区用 dark：文字换成深底上的对色 */
  tone?: Tone;
}) {
  const tone = props.tone ?? 'light';
  // 浅色区放 ink-soft（白底 11.98:1、浅蓝底 11.2:1）；深色区放 brand-300（深底 6.64:1）
  const textClass = tone === 'dark' ? 'text-brand-300' : 'text-ink-soft';

  return <div className={`text-note font-semibold ${textClass}`}>{props.children}</div>;
}
