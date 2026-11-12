import { DocsShell } from '@/components/docs-shell';

export const metadata = { title: '更新记录' };

type Entry = { date: string; title: string; items: string[] };

const ENTRIES: Entry[] = [
  {
    date: '2026-11-11',
    title: '文档站改版，补齐协议与错误处理',
    items: [
      '文档拆成多页：概览、快速开始、认证、协议选择、文本与对话、错误码、第三方工具接入。',
      '新增「接口速查」，列出网关全部路由与当前可用状态。',
      '补充计费口径：输入 / 输出 / 缓存命中的计价方式与分时段说明。',
      '补充错误返回体结构，以及每种状态码的处理建议。',
    ],
  },
  {
    date: '2026-11-10',
    title: '模型广场与价格页上线',
    items: [
      '模型清单与单价改为直读后台计费配置，与下单金额一致。',
      '价格页支持分时展示：工作日白天为高峰价，其余时间为空闲价。',
    ],
  },
];

/** 更新记录：客户会问「你们多久更新一次」，这里要能答上来 */
export default function ChangelogPage() {
  return (
    <DocsShell>
      <h1 className="text-display font-bold tracking-tight text-ink">更新记录</h1>
      <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-mid">
        接口兼容性变更、模型上下架、文档修订都记在这里。新到旧排列。
      </p>

      <section id="log" className="mt-9 scroll-mt-24">
        <div className="space-y-7">
          {ENTRIES.map((entry) => (
            <div key={entry.date} className="border-l-2 border-brand/20 pl-5">
              <div className="font-mono text-meta text-brand">{entry.date}</div>
              <h2 className="mt-1 text-title font-semibold text-ink">{entry.title}</h2>
              <ul className="mt-2 space-y-1.5 text-body leading-relaxed text-ink-mid">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-card border border-line bg-surface-tint-soft px-5 py-4">
          <h3 className="text-body font-semibold text-ink">关于模型上下架</h3>
          <p className="mt-1.5 text-note leading-relaxed text-ink-mid">
            模型下线会提前在控制台公告，并在这份记录里留一条，给调用方留出迁移时间。
            新增模型不需要你改代码——把 model 字段换成新 ID 即可。
          </p>
        </div>
      </section>
    </DocsShell>
  );
}
