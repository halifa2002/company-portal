import { PreviewIcon, type IconName } from './icons';
import { Reveal } from './reveal';

/**
 * 「为什么用我们 / 价格怎么来的」双栏（2026-11-13 第四版，只给 /preview/home 用）
 *
 * 版式取自参考站首页的两栏对照：左栏回答「凭什么信你」，右栏回答「为什么这个价」。
 *
 * 这一版把六张卡改成六行——上一版两栏各三张卡，加起来六张同尺寸的浅框，
 * 加上上面「平台能力」的六张，一页里出现十二张长得一样的卡，
 * 到这一段读者已经不看内容了，只看见一片框。
 *
 * 现在：不留框，用细线分行的清单。行高固定、图标缩到 32、悬停整行提亮。
 * 两栏之间一道竖线——它不是装饰，是把"两种问题"分开的那条界线。
 * 这六条是承诺不是入口，所以整行不可点（做成可点反而像凑数）。
 */

type Point = {
  readonly title: string;
  readonly desc: string;
  readonly icon: IconName;
};

const trustPoints: ReadonlyArray<Point> = [
  {
    title: '模型不降级',
    desc: '请求打到哪个模型就是哪个，不会为了省成本悄悄换成更便宜的。',
    icon: 'shield-check',
  },
  {
    title: '一个网关收掉差异',
    desc: '三种协议、多路上游都在网关后面，换模型只改一个字段。',
    icon: 'route',
  },
  {
    title: '额度卡在 Key 上',
    desc: '每个 Key 单独设额度上限和可用模型，一个应用吃不光整月预算。',
    icon: 'key',
  },
];

const pricePoints: ReadonlyArray<Point> = [
  {
    title: '批量采购',
    desc: '按企业量级跟上游谈采购价，用量越大，谈下来的单价越低。',
    icon: 'layers',
  },
  {
    title: '按实际用量结算',
    desc: '没有最低消费，没有包月门槛，用多少扣多少。',
    icon: 'gauge',
  },
  {
    title: '价格公开，不加暗费',
    desc: '单价写在页面上，后台改价页面同步，账单逐条对得上具体请求。',
    icon: 'eye',
  },
];

function Column({
  kicker,
  title,
  lead,
  points,
}: {
  kicker: string;
  title: string;
  lead: string;
  points: ReadonlyArray<Point>;
}) {
  return (
    <div>
      <Reveal>
        <span className="pv-eyebrow">{kicker}</span>
        <h2 className="pv-h3 mt-4">{title}</h2>
        <p className="mt-3 text-note leading-[1.8] text-ink-mid">{lead}</p>
      </Reveal>

      {/* 细线清单：不留框，行与行之间一条线，读起来像一份承诺清单 */}
      <div className="mt-7 border-t border-[#e3eaf2]">
        {points.map((point, index) => (
          <Reveal key={point.title} delay={0.06 + index * 0.05}>
            <div className="group flex gap-4 border-b border-[#e3eaf2] py-5 transition-colors duration-300 hover:bg-white/70">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#e6eef6] bg-white text-brand">
                <PreviewIcon name={point.icon} size={17} />
              </span>

              <div className="min-w-0">
                <h3 className="text-title font-semibold tracking-tight text-ink">{point.title}</h3>
                <p className="mt-1.5 text-balance text-note leading-[1.75] text-ink-mid">{point.desc}</p>
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
    <section id="why-and-price" className="pv-sec pv-tint">
      <div className="pv-wrap">
        {/*
          两栏等宽、中间一条竖线 + 一道宽缝。
          窄屏堆叠时不做分隔线——竖线在手机上会变成一条横线，多一道没人看得懂的横杠。
        */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
          <div className="lg:pr-14">
            <Column
              kicker="01"
              title="为什么用虫洞 AI"
              lead="把接哪家、怎么计费收进网关，模型之间的差异对你没有影响。"
              points={trustPoints}
            />
          </div>

          <div className="lg:border-l lg:border-[#e3eaf2] lg:pl-14">
            <Column
              kicker="02"
              title="这个价格是怎么来的"
              lead="一个账户，一张账单。价格从采购价往下算，平台只收中间一层。"
              points={pricePoints}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
