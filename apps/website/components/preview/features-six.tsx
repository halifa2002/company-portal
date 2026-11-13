import { capabilities } from './home-content';

/**
 * 平台能力六条（2026-11-13 第十版，只挂 /preview/home）
 *
 * 这一版给每张卡补一张**灰线插画**。
 *
 * 为什么：Supabase 的官网上，每张能力卡里都有一张细线几何图（数据库画成线框、
 * 认证画成输入框线稿）。那种图既不是照片也不是图标，是「技术蓝图」——
 * 它让一张纯文字的卡立刻有了「这个东西有结构」的感觉。
 * 我们之前六张卡全是「标题 + 两行字」，所以整段读起来像一张说明书。
 *
 * 插画全部用 SVG 线稿现画，不引任何图片素材：
 * 线宽 1、颜色 #cfdcea（只比边框深一点），卡片底色白，落在浅底上刚好看见。
 */

/** 六张插画，按 capabilities 的顺序对应 */
const ART = [
  /* 0 主流模型覆盖：六个方框排成网 */
  <g key="a">
    <rect x="9" y="10" width="24" height="15" rx="3" />
    <rect x="41" y="10" width="24" height="15" rx="3" />
    <rect x="73" y="10" width="24" height="15" rx="3" />
    <rect x="9" y="36" width="24" height="15" rx="3" />
    <rect x="41" y="36" width="24" height="15" rx="3" />
    <rect x="73" y="36" width="24" height="15" rx="3" />
    <path d="M5 66h96" strokeDasharray="3 5" />
  </g>,

  /*
   * 1 统一接口：三条线收到一个点。
   *
   * 2026-11-13 修：上一版三条线的终点各不相同（32 / 40 / 48，而且都停在 x=56），
   * 圆点在 62.5 才开始，于是左边三条线既没对齐圆心、也没接到圆点，中间那条还矮半格。
   * 现在三条线一律用 (60,36) 作为收敛点，圆点圆心 (64,36)、半径 4，正好接上。
   */
  <g key="b">
    <path d="M8 12h22c12 0 16 24 30 24" />
    <path d="M8 36h52" />
    <path d="M8 60h22c12 0 16-24 30-24" />
    <circle cx="64" cy="36" r="4" />
    <path d="M68 36h24" />
    <circle cx="95" cy="36" r="2.5" fill="#b9cde3" stroke="none" />
  </g>,

  /* 2 稳定调用：一条线分成三条 */
  <g key="c">
    <path d="M10 32h20" />
    <circle cx="34" cy="32" r="3.5" />
    <path d="M40 32c12 0 12-16 24-16" />
    <path d="M40 32h24" />
    <path d="M40 32c12 0 12 16 24 16" />
    <path d="M68 16h22" strokeDasharray="3 4" />
    <path d="M68 32h22" />
    <path d="M68 48h22" strokeDasharray="3 4" />
  </g>,

  /* 3 成本透明：四根柱 + 一条基准线 */
  <g key="d">
    <path d="M8 62h90" />
    <rect x="16" y="40" width="14" height="22" rx="2" />
    <rect x="38" y="28" width="14" height="34" rx="2" />
    <rect x="60" y="46" width="14" height="16" rx="2" />
    <rect x="82" y="20" width="14" height="42" rx="2" />
  </g>,

  /* 4 额度可控：圆环 + 一段弧 */
  <g key="e">
    <circle cx="40" cy="36" r="22" strokeDasharray="2 5" />
    <path d="M40 14a22 22 0 0 1 15.6 37.6" strokeWidth="2.5" />
    <path d="M34 36h12M40 30v12" opacity="0.7" />
    <path d="M74 24h20M74 36h14M74 48h24" strokeDasharray="3 4" />
  </g>,

  /* 5 接入零改造：两个方框 + 一条箭头 */
  <g key="f">
    <rect x="8" y="20" width="30" height="32" rx="4" />
    <path d="M15 30h16M15 38h12" opacity="0.75" />
    <path d="M42 36h26" />
    <path d="M63 32l5 4-5 4" />
    <rect x="72" y="20" width="26" height="32" rx="13" />
    <path d="M80 36h10" opacity="0.75" />
  </g>,
];

export function FeaturesSix() {
  return (
    /*
      浅底：和白底的价格表、快速开始隔开，段落边界靠底色而不是靠空白。
      2026-11-13 改为微蓝灰——原来铺的是浅蓝 #f1f7fd，用户判定「这个蓝做背景难看」：
      蓝一铺成整段背景，白卡就像贴上去的；加上首屏已经是一大块蓝渐变，第二块蓝底等于同色出现两次。
      先用中性灰 #eef1f4 试过，再判定「和蓝色品牌不是一个调」，最终定 #eaf0f7：
      它是灰，但掺了一点蓝，色温和主色同族；蓝只留给图标和链接。
    */
    <section className="pv-sec bg-[#eaf0f7]">
      <div className="pv-wrap">
        <div className="text-center">
          <h2 className="pv-h2">
            接入、计费、额度，
            <br />
            收进一个网关
          </h2>
          <p className="pv-sub mx-auto max-w-[40em]">
            不自研模型。把上游的差异挡在网关后面，下游只面对一套地址、一把 Key 和一份账单。
          </p>
        </div>

        {/* gap-px + 底板色 = 一像素分隔线；不用给每张卡单独描边 */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-[10px] border border-[#e4ebf3] bg-[#e4ebf3] sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, index) => (
            <div key={item.title} className="flex flex-col bg-white p-7">
              <span className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#f1f8ff] text-[#0a74e0]">
                <svg
                  width="17"
                  height="17"
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

              <h3 className="mt-4 text-[15.5px] font-semibold tracking-tight text-[#06223f]">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.75] text-[#5c7189]">{item.desc}</p>

              {/*
                灰线插画：统一 106×76 的画布、统一线宽和颜色，
                六张放在一起才像一套，而不是六个随手画的图。
              */}
              <div aria-hidden className="mt-auto pt-6 text-[#a3b9d0]">
                <svg
                  viewBox="0 0 106 76"
                  className="h-[86px] w-full"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                >
                  {ART[index]}
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
