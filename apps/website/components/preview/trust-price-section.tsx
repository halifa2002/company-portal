import type { ReactNode } from 'react';
import { Reveal } from './reveal';

/**
 * 「为什么用我们 / 价格怎么来的」双栏（2026-11-13，只给 /preview/home 用）
 *
 * 版式取自 TeamoRouter 首页的两栏对照：左栏回答「凭什么信你」，右栏回答「为什么这个价」。
 * 两栏各三张细边框卡，卡片不做成链接——这六条是承诺不是入口，点了也没地方去，
 * 做成可点反而像凑数。
 *
 * 为什么替换掉原来那六条能力：那六条里「统一接口 / 稳定调用 / 接入零改造」
 * 在接入示例与接入三步里已经讲过一遍，「成本透明 / 额度可控」又和右栏重复。
 * 六条并排读的人记不住，压成三条承诺反而留得住。
 *
 * 右栏三条只写能验证的事：批量采购是正在推进的方向，按量计费和价格公开
 * 是后台计费本来就这样的。不写具体折扣数字——数字一写就变成承诺，改起来麻烦。
 */

type Point = {
  readonly title: string;
  readonly desc: string;
  readonly icon: ReactNode;
};

const trustPoints: ReadonlyArray<Point> = [
  {
    title: '模型不降级',
    desc: '请求打到哪个模型就是哪个，不会为了省成本悄悄换成更便宜的。',
    icon: (
      <>
        <circle cx="3.8" cy="12" r="1.4" />
        <path d="M5.6 12h11.6M13.6 8.2 17.4 12l-3.8 3.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: '一个网关收掉差异',
    desc: '三种协议、多路上游都在网关后面，换模型只改一个字段。',
    icon: (
      <>
        <rect x="9.2" y="6.4" width="5.6" height="11.2" rx="1.6" />
        <path d="M6.4 12H3.4M17.6 12h3" strokeLinecap="round" />
        <path d="M6.4 9.4 3.4 12l3 2.6M17.6 9.4l3 2.6-3 2.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: '额度卡在 Key 上',
    desc: '每个 Key 单独设额度上限和可用模型，一个应用吃不光整月预算。',
    icon: (
      <>
        <circle cx="8" cy="12" r="3.6" />
        <path d="M11.6 12h8M17.4 12v2.8M19.6 12v2.2" strokeLinecap="round" />
      </>
    ),
  },
];

const pricePoints: ReadonlyArray<Point> = [
  {
    title: '批量采购',
    desc: '按企业量级跟上游谈采购价，用量越大，谈下来的单价越低。',
    icon: (
      <>
        <path d="M12 3.6 19 7.2 12 10.8 5 7.2z" strokeLinejoin="round" />
        <path d="M5 11.4 12 15l7-3.6M5 15.6 12 19.2l7-3.6" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: '按实际用量结算',
    desc: '没有最低消费，没有包月门槛，用多少扣多少。',
    icon: (
      <>
        <path d="M4 19.2h16" strokeLinecap="round" />
        <path d="M7 19.2V12M12 19.2V7.4M17 19.2v-5.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: '价格公开，不加暗费',
    desc: '单价写在页面上，后台改价页面同步，账单逐条对得上具体请求。',
    icon: (
      <>
        <path
          d="M12.6 3.6h6.2v6.2L9.2 19.4a1.6 1.6 0 0 1-2.3 0l-4.3-4.3a1.6 1.6 0 0 1 0-2.3z"
          strokeLinejoin="round"
        />
        <circle cx="15.4" cy="7.4" r="1.3" />
      </>
    ),
  },
];

function Column({
  title,
  lead,
  points,
  tone = 'brand',
}: {
  title: string;
  lead: string;
  points: ReadonlyArray<Point>;
  /** 左栏讲「凭什么信你」走品牌蓝；右栏讲「价格怎么来的」走暖色，一眼分得开 */
  tone?: 'brand' | 'warm';
}) {
  const iconShell =
    tone === 'warm'
      ? 'bg-[#fdf3e6] text-[#b45309]'
      : 'bg-brand-50 text-brand';
  return (
    <div>
      <Reveal>
        <h2
          className="text-balance font-display font-bold tracking-[-0.025em] text-ink"
          style={{ fontSize: 'clamp(23px, 2vw, 29px)', lineHeight: 1.25 }}
        >
          {title}
        </h2>
        <p className="mt-3 text-note leading-relaxed text-ink-mid">{lead}</p>
      </Reveal>

      <div className="mt-8 space-y-3">
        {points.map((point, index) => (
          <Reveal key={point.title} delay={0.06 + index * 0.05}>
            <div className="flex gap-4 rounded-card border border-line bg-white p-5 transition-colors duration-300 hover:border-brand/25 md:gap-5 md:p-6">
              {/*
                图标底色用极浅的品牌色：整段是浅灰底、白卡片，图标再走中性灰
                就三个灰阶叠在一起，扫一眼看不出哪是图标。
              */}
              <span className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] ${iconShell}`}>
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden
                >
                  {point.icon}
                </svg>
              </span>

              <div className="min-w-0">
                <h3 className="text-title font-semibold tracking-tight text-ink">{point.title}</h3>
                <p className="mt-1.5 text-balance text-note leading-relaxed text-ink-mid">
                  {point.desc}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function TrustPriceSection() {
  return (
    /*
     * 底色换成浅灰：上一段（平台概览）是白底，这一段要跟它分开；
     * 下面一段是模型与定价，先用浅底把「选型」和「选型号」隔开。
     */
    <section id="why-and-price" className="border-b border-line bg-surface-subtle py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
        {/*
          两栏等宽、中间留一道宽缝：这两组字数差不多，宽度不相等会让右边显得像补充说明。
          窄屏堆叠时不做分隔线——竖线在手机上会变成一条横线，多一道没人看得懂的横杠。
        */}
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 xl:gap-28">
          <Column
            title="为什么用虫洞 AI"
            lead="把接哪家、怎么计费收进网关，模型之间的差异对你没有影响。"
            points={trustPoints}
          />
          <Column
            title="这个价格是怎么来的"
            lead="一个账户，一张账单。价格从采购价往下算，平台只收中间一层。"
            points={pricePoints}
            tone="warm"
          />
        </div>
      </div>
    </section>
  );
}
