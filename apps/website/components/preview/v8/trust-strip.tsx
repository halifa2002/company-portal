/**
 * 能力胶囊行（v9，2026-11-14）
 *
 * 与上一版「一行纯文字 + 对勾」的关系：把对勾换成胶囊，是因为首屏现在有了路由图，
 * 图里已经是白卡 + 细边的语言，再放一行裸文字会显得没做完；胶囊和图里的卡片同族。
 *
 * 之前那版否掉胶囊的理由是「胶囊 + hover tooltip 是模板站做法」——问题不在胶囊，
 * 在**悬浮气泡和交互**。所以这里：无 tooltip、无 hover、无背景色变化，纯静态标签。
 *
 * 文案保持 4–6 字，不与下方能力区的六条详细描述重复。
 */

const FEATURES = ['三协议合一', '按量计费', '自动重试', '额度隔离', '用量追踪', '零改造接入'];

function Check() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-brand-700"
    >
      <path d="M2 6.2 4.8 9 10 3.4" />
    </svg>
  );
}

export function TrustStrip() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-2">
      {FEATURES.map((feature) => (
        <li
          key={feature}
          className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[12.5px] text-ink-mid backdrop-blur"
        >
          <Check />
          {feature}
        </li>
      ))}
    </ul>
  );
}
