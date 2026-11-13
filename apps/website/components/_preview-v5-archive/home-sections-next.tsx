import Link from 'next/link';
import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList } from '@/lib/pricing';
import { CodePreview } from './code-preview';
import { capabilities, steps } from './home-content';
import { Reveal } from './reveal';

/**
 * 首页中段三块（2026-11-13 第四版，只给 /preview/home 用）
 *
 * 第三版追求的是「三块同一个开法」，结果整齐了，也平了：
 * 三段一模一样的居中标题 + 一模一样的留白，扫下去没有顿挫，
 * 页面像一张 PPT 里连着三页同一个版式。
 *
 * 这一版做的是**节奏**：四段底色交替，每段的"内容形态"本来就是不同的，
 * 就让形态自己说话，不再硬把它们套进同一个开头。
 *
 *   平台能力 —— 白底、居中头、一排数字 + 六张卡（最"密"的一段）
 *   接入示例 —— 深海军蓝整幅（全页唯一一次呼吸停顿），左说明 / 右代码 / 底部拓扑图
 *   接入三步 —— 白底、一条横带（最"轻"的一段，给眼睛歇一下）
 *
 * 配色仍守领导文档 7.1：浅底、深字、蓝只做强调。
 * 深色块用品牌色阶里的 brand-950 家族，不引新色相。
 */

export async function CapabilitiesNext() {
  const { models } = await loadModelList(MODEL_CATALOG);
  const vendorCount = new Set(models.map((model) => model.vendorName)).size;
  /*
   * 只放站得住的数字。「类任务」试过，目录里只有两个类别，摆上去反而是弱项；
   * 宁可三格，也不要为了凑四格加一个不好看的数。
   */
  const stats = [
    { value: models.length, label: '个模型' },
    { value: vendorCount, label: '家厂商' },
    { value: 3, label: '种协议' },
  ];

  return (
    <section className="pv-sec bg-white">
      <div className="pv-wrap">
        <Reveal>
          <div className="pv-head">
            <span className="pv-eyebrow">平台能力</span>
            <h2 className="pv-h2 mt-4">
              接入、计费、额度，
              <br />
              收进一个网关
            </h2>
            <p className="pv-sub">
              不自研模型。把上游的差异挡在网关后面，下游只面对一套地址、一把 Key 和一份账单
            </p>
          </div>
        </Reveal>

        {/* 一排数字：先给三个硬指标，比一句形容词有用 */}
        <Reveal delay={0.04}>
          <dl className="pv-stat mx-auto mt-11 max-w-[820px] grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="pv-num text-[34px] leading-none text-ink md:text-[40px]">{stat.value}</dd>
                <dt className="mt-2.5 text-meta text-ink-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        {/*
          六张同规格的卡片。跟上一版的三处不同：
          1. 卡片有底色（#f8fbfe），落在白底上能看出"这是一块"；
          2. 图标从左上一个变成一个方框，右上角补一个 01–06 的序号——卡片右上角不再空着；
          3. 悬停整块抬 2px、边框加深，鼠标扫过有反馈，不是六张死图。
        */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04} from="scale">
              <div className="pv-card pv-card--hover h-full bg-[#f8fbfe] p-6">
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#e6eef6] bg-white text-brand">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {item.icon}
                    </svg>
                  </span>
                  <span className="pv-num text-[11px] text-ink-muted/60">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-5 text-title font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-2 text-note leading-[1.75] text-ink-mid">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-9 flex justify-center">
          <Link href="/docs" className="pv-btn pv-btn--ghost">
            看接入文档
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ApiSectionNext() {
  return (
    <section className="pv-dark pv-sec relative overflow-hidden">
      {/* 底色：两团很淡的蓝光，压住大面积深色的"死黑" */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 60% at 14% 6%, rgba(24,141,249,0.24) 0%, rgba(6,34,63,0) 64%), radial-gradient(48% 54% at 92% 88%, rgba(24,141,249,0.16) 0%, rgba(6,34,63,0) 62%)',
        }}
      />
      {/* 一层极淡的格线：让深色块不是一块死平面 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)',
          backgroundSize: '88px 88px',
          maskImage: 'radial-gradient(72% 60% at 50% 34%, #000 0%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(72% 60% at 50% 34%, #000 0%, transparent 78%)',
        }}
      />

      <div className="pv-wrap relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-14">
          {/* 左：文案 + 三条要点 */}
          <Reveal>
            <span className="pv-eyebrow">接入示例</span>
            <h2 className="pv-h2 mt-4">
              把地址换掉，
              <br />
              就能发第一个请求
            </h2>
            <p className="pv-sub">
              四种协议共用同一套地址与密钥。左边是请求进来的路径，右边是可以直接抄走的代码。
            </p>

            {/* 三条短要点：一行一条，细线分隔——深底上做卡片会变成三张贴纸 */}
            <ul className="mt-8 border-t border-white/12 text-body text-white/85">
              {['换地址与密钥即可，SDK 不用改', '同一模型多路上游，异常自动切换', '每次调用都记进用量明细'].map(
                (item) => (
                  <li key={item} className="flex items-start gap-3 border-b border-white/12 py-3.5">
                    <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#5eb0f5]" />
                    {item}
                  </li>
                ),
              )}
            </ul>

            <Link href="/docs" className="pv-btn pv-btn--on-dark mt-8">
              打开接入文档
              <span aria-hidden>→</span>
            </Link>
          </Reveal>

          {/* 右：深色代码窗。从右边滑进来——全页其他都是上浮，这里换个方向 */}
          <Reveal delay={0.08} from="side">
            <div className="mb-3 flex items-center justify-between">
              <span className="pv-kicker">调用示例</span>
              <Link href="/docs" className="text-meta text-[#7cbdf5] transition-colors hover:text-white">
                打开接入文档 →
              </Link>
            </div>
            <CodePreview tone="dark" />
          </Reveal>
        </div>

      </div>
    </section>
  );
}

/**
 * 接入三步（第四版）
 *
 * 三步是一条线，所以排成一条横带、用竖线隔开，编号压在最上面。
 * 这一版只把编号放大并换成"幽灵数字"（很淡的大号等宽字），
 * 上一版 12px 的小编号既不像序号也不像标签，白占一行。
 */
export function StepsNext() {
  return (
    <section className="pv-sec bg-white">
      <div className="pv-wrap">
        <Reveal>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="pv-head pv-head--left">
              <span className="pv-eyebrow">接入流程</span>
              <h2 className="pv-h2 mt-4">三步接入，不用重写代码</h2>
            </div>
            <Link href="/docs" className="pv-btn pv-btn--ghost shrink-0">
              打开接入文档
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-y-9 sm:grid-cols-3 sm:gap-x-0">
          {steps.map((step, index) => (
            <Reveal key={step.no} delay={index * 0.06}>
              <div
                className={`h-full px-0 sm:px-9 ${
                  index === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-[#e3eaf2]'
                }`}
              >
                <div className="flex items-baseline gap-3">
                  {/*
                    编号原来用 #dbe6f1——落在白底上只有 3% 的对比，
                    远看就是"那里有个东西但读不出来"，像渲染失败。
                    压深到 #9db4cc：仍然是大号浅数字，但一眼能认出是 01/02/03。
                  */}
                  <span className="pv-num text-[30px] font-semibold leading-none text-[#9db4cc]">
                    {step.no}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-[#e3eaf2]" />
                </div>
                <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">{step.title}</h3>
                <p className="mt-2 text-body leading-[1.75] text-ink-mid">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 模型与定价入口（横带）
 *
 * 旧版是「一张容器、竖线切两格」。这里压成一条横向快捷带：
 * 一条上下细线、两个入口名字直接可点，不再给卡片。
 */
export function ModelPricingNext() {
  return (
    <section className="pv-sec pv-sec--tight pv-tint">
      <div className="pv-wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="pv-kicker">模型与定价</div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-10">
            {[
              { eyebrow: '立即体验', title: '浏览可用模型', desc: '能力、上下文长度与调用方式', href: '/models' },
              { eyebrow: '计费透明', title: '查看实时定价', desc: '单价、计费规则与额度说明', href: '/pricing' },
            ].map((item, index) => (
              <div key={item.href} className="flex items-center gap-10">
                {index > 0 ? <span aria-hidden className="hidden h-10 w-px bg-[#dbe6f1] sm:block" /> : null}
                <Link href={item.href} className="group flex items-center gap-3">
                  <div>
                    <div className="text-meta text-ink-muted">{item.eyebrow}</div>
                    <div className="mt-1 flex items-center gap-2 text-title font-semibold text-ink transition-colors group-hover:text-brand">
                      {item.title}
                      <span
                        aria-hidden
                        className="text-body text-ink-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                      >
                        →
                      </span>
                    </div>
                    <div className="mt-1 text-note text-ink-mid">{item.desc}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
