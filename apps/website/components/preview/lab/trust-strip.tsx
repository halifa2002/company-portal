/**
 * 能力胶囊行（v9，2026-11-14；hover 于 2026-11-15 补上）
 *
 * 与上一版「一行纯文字 + 对勾」的关系：把对勾换成胶囊，是因为首屏现在有了路由图，
 * 图里已经是白卡 + 细边的语言，再放一行裸文字会显得没做完；胶囊和图里的卡片同族。
 *
 * 早先「无 hover」是因为否掉的是「胶囊 + 悬浮气泡（tooltip）」那种模板站做法，
 * 不是否掉所有反馈。现在按 teamorouter.com 实测补上克制版：
 *   transform: none → translateY(-2px)
 *   background: rgba(255,255,255,0.5) → rgba(255,255,255,0.72)
 * 只上浮 2px、背景提实一档，不加阴影、不改文字色、不做气泡。
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
      className="shrink-0 text-brand-400"
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
          className="flex items-center gap-1.5 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[12.5px] text-white/80 backdrop-blur transition-[translate,background-color] duration-200 ease-out hover:bg-white/18 hover:[translate:0_-2px]"
        >
          <Check />
          {feature}
        </li>
      ))}
    </ul>
  );
}
