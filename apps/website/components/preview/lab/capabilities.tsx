/**
 * v8 首页两块内容（2026-11-14 第二版：拆成两个模块）
 *
 * 原来它们是一个 section：标题「同一套地址、Key 和账单」下面挂着
 * 「四步链路 + 路由判定 + 故障切换 + 四条卖点」，四类内容一个标题罩着。
 * 用户看了问「要拆分成两个模块吗」——该拆，因为两组回答的是不同问题：
 *   ① RequestFlow  答「请求进来以后，网关里发生了什么」（过程）
 *   ② Capabilities 答「用了这个平台我能得到什么」（价值）
 * 拆开之后各自有自己的标题，页面节奏也从「一屏塞两类」变成两屏各讲一件事。
 *
 * 顺序保持 快速开始 → 请求怎么走 → 平台能力 → 两种接入；
 * 底色交替（surface → white 白 → surface-neutral 浅灰 → 白），避免连续同色黏成一整块。
 *
 * 数据纪律：上一版那块 46%/27%/17%/10% 的分配条是编的，已删。机制只用规则与角色表达，
 * 不摆任何具体百分比或金额（C-D-02：没接真实数据就不许出现数字）。
 */

import { Gauge, Layers, Plug, ReceiptText } from 'lucide-react';
import { FlowStrip } from './flow';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

/**
 * 每条的图标（2026-11-14 第三次定稿：改回线性图标，用 lucide 这套现成的）。
 *
 * 演进：18px 手写线性 → 64px 自绘几何双色 → **22px lucide 线性**。
 * 为什么放弃自绘几何：
 *   ① 审美疲劳。四枚都是「圆角块 + 一颗点」同源形状，连看四个像复制粘贴；
 *      而图标并列成组时，读者靠的恰恰是**轮廓差异**（层叠 / 票据 / 表盘 / 插头）。
 *   ② 自绘的成本与风险都由我们承担（配色、比例、每加一条都要新画一枚），
 *      而 lucide 是已经调好比例与描边的现成图标库，项目里本来就有这个依赖。
 *   ③ 分工更清楚：**几何双色只留在「价格口径」那三枚大图里**（88px、单发、当插画），
 *      成组出现的小图标一律走线性单色——成组要差异，单发要气质。
 *
 * 规格统一：22px、strokeWidth 1.6、颜色 ink-muted（白底 4.80:1，过 4.5 正文标准）。
 */
const ICONS: Record<string, React.ReactNode> = {
  '01': <Layers size={22} strokeWidth={1.6} className="text-ink-muted" />,
  '02': <ReceiptText size={22} strokeWidth={1.6} className="text-ink-muted" />,
  '03': <Gauge size={22} strokeWidth={1.6} className="text-ink-muted" />,
  '04': <Plug size={22} strokeWidth={1.6} className="text-ink-muted" />,
};

const CAPABILITIES = [
  {
    no: '01',
    title: '主流模型覆盖',
    desc: '对话、推理、编程几类模型统一接入，厂商上新我们跟着接。',
  },
  {
    no: '02',
    title: '成本透明',
    desc: '价格、用量、账单在同一处查看，每一笔扣费都能追到具体请求。',
  },
  {
    no: '03',
    title: '额度可控',
    desc: '每个 Key 单独设额度上限与可用模型，一个应用超支不影响其他应用。',
  },
  {
    no: '04',
    title: '接入零改造',
    desc: '换掉 base_url 与密钥即可上线，文档、示例与常见客户端都已就绪。',
  },
];

/** 路由判定：三条规则，讲清「这次请求为什么会去那家」 */
const ROUTE_RULES = [
  { when: '请求里写了 model', then: '直接走这个模型对应的线路，不参与比价' },
  { when: '没写 model，或那条线路暂时不可用', then: '按单价与可用性，自动挑一条' },
  { when: '想固定走某条线', then: '自己钉死一条，网关不再替你换' },
];

/** 线路角色：只说「它在这条请求里排第几」，不伪装成实时运行状态 */
const UPSTREAMS = [
  { name: 'openai · gpt-6-luna', role: '主线路' },
  { name: 'deepseek · deepseek-flash', role: '主线路' },
  { name: 'zhipu · glm-5.3', role: '备用线路' },
];

/** 模块一：请求怎么走（过程） */
export function RequestFlow() {
  return (
    <section className="border-b border-line py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
          <div>
            <SectionEyebrow>调用链路</SectionEyebrow>
            <h2
              className="mt-4 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.2 }}
            >
              一次请求，在网关里走完这四步
            </h2>
          </div>
          <p className="text-note leading-relaxed text-ink-mid md:pb-1.5">
            你的应用 → 鉴权与计量 → 路由与重试 → 上游厂商。上游的差别挡在这一层后面，调用方看到的永远是一次普通请求。
          </p>
        </div>

        <FlowStrip />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* ① 路由判定 */}
          <div className="border-t border-line pt-5">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-note font-semibold text-ink">一次请求，为什么会落到某家上游</h3>
              <span className="shrink-0 text-meta text-ink-muted">按顺序判断</span>
            </div>

            <ol className="mt-4 divide-y divide-line border-y border-line">
              {ROUTE_RULES.map((rule, index) => (
                <li key={rule.when} className="flex items-start gap-3 py-2.5 text-meta">
                  <span className="shrink-0 font-mono text-ink-muted">
                    {'0'}
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-ink">{rule.when}</span>
                    <span className="mt-0.5 block text-ink-muted">→ {rule.then}</span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-3 text-meta leading-relaxed text-ink-muted">
              三条规则从上往下命中的第一条生效；所以只要你写清 model，走哪家就是确定的。
            </p>
          </div>

          {/* ② 故障切换 */}
          <div className="border-t border-line pt-5">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-note font-semibold text-ink">上游出错，自动换下一条线路</h3>
              <span className="shrink-0 text-meta text-ink-muted">线路角色</span>
            </div>

            <ul className="mt-4 divide-y divide-line border-y border-line">
              {UPSTREAMS.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-2.5 py-2.5 font-mono text-meta text-ink-soft"
                >
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      item.role === '主线路' ? 'bg-brand-500' : 'bg-ink-muted'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                  <span className="ml-auto shrink-0 text-ink-muted">{item.role}</span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-meta leading-relaxed text-ink-muted">
              5xx 与超时不再透传给你：网关先换线路重试，重试结果连同错误码一起记进调用日志。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 模块二：平台能力（价值） */
export function Capabilities() {
  return (
    <section className="border-b border-line py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
          <div>
            <SectionEyebrow>平台能力</SectionEyebrow>
            <h2
              className="mt-4 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.2 }}
            >
              同一套地址、Key 和账单
            </h2>
          </div>
          <p className="text-note leading-relaxed text-ink-mid md:pb-1.5">
            不自研模型。把上游的差异挡在网关后面，下游只面对一套地址、一把 Key 和一份账单。
          </p>
        </div>

        <ul className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {CAPABILITIES.map((item) => (
            <li key={item.no} className="border-t border-line pt-4">
              <div className="flex items-start justify-between">
                <span className="font-mono text-meta tracking-[0.1em] text-ink-muted">
                  {item.no}
                </span>
                {ICONS[item.no]}
              </div>
              <h3 className="mt-2 text-heading font-semibold tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-note leading-relaxed text-ink-mid">{item.desc}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 border-t border-line pt-4 text-meta leading-relaxed text-ink-muted">
          另外几条也能自己核：业务数据不落库 · 额度按 Key 隔离 · 每笔调用可追溯到单次请求 ·
          协议与官方文档一致。
        </p>
      </div>
    </section>
  );
}


