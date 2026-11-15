/**
 * 调用链路（紧凑版）。
 *
 * 2026-11-14 改：原来是一整屏「一次请求经过哪几步 + 三个状态卡」，
 * 但它和下面的能力区讲的是同一件事（网关做了什么），各占一屏显得空。
 * 现在压成一条细带，嵌在能力区顶部——信息一条不少，篇幅减一屏。
 */

const STEPS = [
  { no: '01', title: '你的应用', desc: '任意 SDK 或 curl' },
  { no: '02', title: '鉴权与计量', desc: '校验 Key 与额度' },
  { no: '03', title: '路由与重试', desc: '按 model 选上游线路' },
  { no: '04', title: '上游厂商', desc: 'OpenAI、DeepSeek 等' },
];

const STATES = [
  { tag: '200', label: '正常返回' },
  { tag: '429', label: '按 retry-after 等待' },
  { tag: '5xx', label: '换线路重试' },
];

export function FlowStrip() {
  return (
    <div className="mt-10 overflow-hidden rounded-none border border-line">
      <ol className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.no} className="group bg-white px-5 py-4 transition-colors duration-200 hover:bg-brand-50/30">
            <span className="font-mono text-meta tracking-[0.1em] text-ink-muted group-hover:text-brand-600">{step.no}</span>
            <div className="mt-1.5 text-note font-medium text-ink">{step.title}</div>
            <div className="mt-1 text-meta text-ink-mid">{step.desc}</div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line bg-surface-subtle px-5 py-3">
        <span className="text-meta text-ink-muted">常见结果</span>
        {STATES.map((state) => (
          <span key={state.tag} className="flex items-center gap-1.5 text-meta text-ink-mid">
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-ink">
              {state.tag}
            </code>
            {state.label}
          </span>
        ))}
      </div>
    </div>
  );
}
