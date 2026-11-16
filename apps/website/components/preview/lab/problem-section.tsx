/**
 * 「接入大模型，你是不是也遇到过这些？」——痛点屏（预览版专用，2026-11-15 新增）
 *
 * 来历：用户给了一版参考稿（浅蓝云底 + 白色圆角卡 + 蓝底图标 + emoji），问「这个怎么样，要做吗」。
 * 结论是内容可用、视觉要重做——参考稿那套（圆角、阴影、emoji、单卡高亮）正是
 * docs/design-playbook 里点名要避开的模板感，而且 5 张卡排 3+2 右下角会留一个空洞。
 *
 * 本版做法（对齐站内已成熟的构件，不新造一套视觉语言）：
 *   ① 骨架照 `capabilities.tsx` 的「eyebrow + clamp 大标题 + 右侧说明段」；
 *   ② 六张卡不是卡片，是六条细线分栏——`border-t border-line` + 等宽数字 + lucide 线性图标，
 *      与「平台能力」那一屏同一套规矩（成组要差异：轮廓分别为路径 / 票据 / 钥匙 / 计时 / 代码 / 警示）；
 *   ③ 6 条排 3×2，正好补上参考稿里空出来的那一格；
 *   ④ 不写任何百分比与金额（纪律 C-D-02：没接真实数据就不许出现数字），只说机制与现象。
 *
 * 为什么卡里只写问题、不写答案：紧接着的「为什么选择 TokenFlow」就是答案屏（两张大卡 + 四能力卡），
 * 这里再答一遍，等于同一件事说两遍。痛点屏只负责让读者点头，收口用一句话把球踢给下一屏。
 */

import Link from 'next/link';
import { ArrowRight, FileCode2, KeyRound, ReceiptText, Route, TimerOff, TriangleAlert } from 'lucide-react';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

/** 六条痛点：编号 / 图标 / 标题 / 说明（说明控制在 2~3 行，三列下不折断阅读节奏） */
const PAINS = [
  {
    no: '01',
    icon: Route,
    title: '每家模型一个地址',
    desc: 'OpenAI、Claude、Gemini 各有各的 base_url、SDK 和请求格式。换一家就要再写一套适配，项目里很快堆满这类代码。',
  },
  {
    no: '02',
    icon: ReceiptText,
    title: '账单像黑洞',
    desc: '调一次花了多少钱、输入和输出各多少 token，多数平台只给一个总数。月底对账，只能靠猜。',
  },
  {
    no: '03',
    icon: KeyRound,
    title: 'Key 越攒越多',
    desc: '每个供应商一把 Key，项目一多就记不住哪把对应哪个。真泄露了一把，也不敢删——怕影响别的业务。',
  },
  {
    no: '04',
    icon: TimerOff,
    title: '挂了只能等',
    desc: '供应商一抖动，业务跟着停。没有备选线路，没有自动重试，用户等到的只有一条超时。',
  },
  {
    no: '05',
    icon: FileCode2,
    title: '加模型要动代码',
    desc: '接一个新模型不只是换个名字：请求结构、超时、并发都要再调一遍，每次上线都像一次小重构。',
  },
  {
    no: '06',
    icon: TriangleAlert,
    title: '超支了才知道',
    desc: '额度没有上限，或者设了没人管。一个跑批任务就能把预算烧完，第二天看见账单才发现。',
  },
];

export function ProblemSection() {
  return (
    <section
      id="pain-points"
      className="relative border-b border-line py-14 md:py-20"
      style={{ backgroundColor: '#eef6ff' }}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
          <div>
            <SectionEyebrow>接入现状</SectionEyebrow>
            <h2
              className="mt-4 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.2 }}
            >
              接入大模型，你是不是也卡在这些地方
            </h2>
          </div>
          <p className="text-note leading-relaxed text-ink-mid md:pb-1.5">
            这些都不是代码写得不好，是上游本来就不统一。绕不过去，它们最后都会变成项目里一层层适配代码。
          </p>
        </div>

        <ul className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {PAINS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.no} className="border-t border-line pt-4">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-meta tracking-[0.1em] text-ink-muted">{item.no}</span>
                  <Icon size={22} strokeWidth={1.6} aria-hidden="true" className="text-ink-muted" />
                </div>
                <h3 className="mt-2 text-heading font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-2 text-note leading-relaxed text-ink-mid">{item.desc}</p>
              </li>
            );
          })}
        </ul>

        {/* 收口：不在本屏给答案，只把话头递到下一屏「为什么选择 TokenFlow」 */}
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-5">
          <p className="text-note text-ink-soft">这些问题交由网关统一处理——换一个地址，其余不用改。</p>
          <Link
            href="#why-choose"
            className="group inline-flex h-10 items-center gap-2 rounded-none border border-ink/25 bg-white px-4 text-meta font-medium text-ink transition-colors hover:border-ink/50 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            查看解决方案
            <ArrowRight
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
