import { RouteMark } from './route-marks';

/**
 * 首屏路由图（v11，2026-11-16）：按 teamorouter.com 那块图逐项复刻。
 *
 * 用户 2026-11-16 的要求是「别自由发挥，除了 logo 照着抄」，并且先**不表现本站真实数据**，
 * 内容也照它摆：左三（Claude / GPT / Gemini）、右四（Claude Code / Codex / CC Switch / OpenClaw）。
 * 等这块定稿，再把厂商与客户端换成 /api/pricing 里的真实数据（见下方 CONTENT 常量，换一处即可）。
 *
 * 从它站点上量到的规格（不是"看着像"）：
 *   - 卡片：高 42，padding 8/16/8/11，圆角 4，1px 白边 rgba(255,255,255,.85)，无阴影，
 *     背景 linear-gradient(rgba(255,255,255,.76), rgba(255,255,255,.52)) + backdrop-filter blur(13px) saturate(1.25)，
 *     图标 23，文字 16 / 行高 24 / 字重 650 / 字距 -0.16；
 *   - 中枢：78px 圆，圆里只有标，说明文字挂在圆下方；
 *   - 标注：mono 10.5px / 字距 .14em / 52% 透明，前面一颗 7×7 方块；右下 mono 12.5px 一行；
 *   - 画布 1300×340，节点按百分比绝对定位；
 *   - 动效：卡片依次淡入（它用 rdIn 620ms、延迟 620+85*i，这里同节奏），连线跑流光，中枢呼吸波纹。
 *
 * 两处有意不同（用户允许的例外）：
 *   ① 中枢圆里放官方标志图形（/brand/tokenflow-icon-512.png）；
 *   ② 底色不搬——用户 2026-11-16 明确「背景你别管」，图仍落在本站蓝色云底上。
 *      代价是连线不能像参考站那样用浅色，只能用各自品牌色的深色 + 亮段流光。
 */

/**
 * 线色照参考站 three.js 里的 tint 原值（见 prototype-route.mjs 的 ROUTES）：
 * Claude / Claude Code #ff7038、Codex #6370ff、CC Switch #ffa024、OpenClaw #ff5238、
 * Claude #ff7038、GPT #bcccd6（炭灰不发光）、Gemini #3f8bff。
 * GPT 的 #bcccd6 在浅蓝底上等于没有，这里压深成 #8A97A3，保留「它不发光」的性格。
 */
const LEFT: { label: string; mark: string; tint: string; light: string }[] = [
  { label: 'Claude', mark: 'claude', tint: '#FF7038', light: '#FF4D00' },
  { label: 'GPT', mark: 'gpt', tint: '#8A97A3', light: '#3A3A3E' },
  { label: 'Gemini', mark: 'gemini', tint: '#3F8BFF', light: '#0A63FF' },
];

const RIGHT: { label: string; mark?: string; img?: string; tint: string; light: string }[] = [
  { label: 'Claude Code', mark: 'claudecode', tint: '#FF7038', light: '#FF4D00' },
  { label: 'Codex', mark: 'codex', tint: '#6370FF', light: '#3D4BFF' },
  { label: 'CC Switch', img: '/route-icons/cc-switch.webp', tint: '#FFA024', light: '#FF9500' },
  { label: 'OpenClaw', mark: 'openclaw', tint: '#FF5238', light: '#FF3B1F' },
];

/** 左列纵向位置（百分比）与对应连线端点 y；与参考站的 23.5 / 50 / 76.5 一致 */
const LEFT_TOPS = ['23.5%', '50%', '76.5%'];
const LEFT_YS = [80, 170, 260];
/** 右列纵向位置与端点 y；参考站是 18.5 / 39.5 / 60.5 / 81.5 */
const RIGHT_TOPS = ['18.5%', '39.5%', '60.5%', '81.5%'];
const RIGHT_YS = [63, 134, 206, 277];

/**
 * 动效层（纯 CSS）：卡片依次淡入、连线流光沿线跑、中枢呼吸波纹。
 * 参考站是 three.js canvas 画的彗星，这里用 stroke-dashoffset 做同一件事，不占主线程。
 */
const MOTION_CSS = `
@keyframes rd-node-in {
  from { opacity: 0; translate: -50% -42%; }
  to   { opacity: 1; translate: -50% -50%; }
}
@keyframes rd-flow {
  from { stroke-dashoffset: 100; }
  to   { stroke-dashoffset: 0; }
}
/* 光带：一个「黑→白→黑」的渐变窗口沿 x 轴扫过，比 dash 好在两端是真渐隐（dash 是平切，像根棒子） */
@keyframes rd-band {
  from { transform: translateX(-380px); }
  to   { transform: translateX(1680px); }
}
@keyframes rd-pulse {
  0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.40; }
  70%  { opacity: 0.10; }
  100% { transform: translate(-50%, -50%) scale(1.95); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .rd-flow-line, .rd-node, .rd-pulse, .rd-band { animation: none !important; }
}
`;

function Node(props: { side: 'left' | 'right'; top: string; delay: number; children: React.ReactNode }) {
  return (
    <div
      className="rd-node absolute flex items-center gap-[10px] rounded-[4px] border border-white/85 py-2 pl-[11px] pr-4 text-[16px] leading-6 tracking-[-0.16px] text-ink"
      style={{
        left: props.side === 'left' ? '10%' : '90%',
        top: props.top,
        translate: '-50% -50%',
        fontWeight: 650,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.76), rgba(255,255,255,0.52))',
        backdropFilter: 'blur(13px) saturate(1.25)',
        WebkitBackdropFilter: 'blur(13px) saturate(1.25)',
        animation: `rd-node-in 600ms cubic-bezier(0.22, 1, 0.36, 1) ${props.delay}ms both`,
      }}
    >
      {props.children}
    </div>
  );
}

function Note(props: { side: 'left' | 'right'; top: string; children: React.ReactNode }) {
  return (
    <span
      className="absolute flex items-center gap-[7px] font-mono text-[10.5px] uppercase tracking-[0.14em] whitespace-nowrap text-white/60"
      style={{ [props.side]: props.side === 'left' ? '12%' : '9%', top: props.top }}
    >
      <i aria-hidden className="h-[7px] w-[7px] shrink-0 bg-current opacity-75" />
      {props.children}
    </span>
  );
}

export function RoutingDiagram() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />

      {/* 2026-11-16 手机/平板版（<1024）：原图是 1300×340 的固定画布，卡片尺寸不随画布缩，
       * 压到 390 宽时画布只剩 102 高，三张卡按 23.5/50/76.5% 叠在一起、还压住右下说明字；
       * 768 宽时右列四张卡（间距 39 < 卡高 42）也还叠着。
       * 所以 1024 以下改成竖排同一套故事（模型 → 中枢 → 客户端），不画连线、不摆两侧标注。
       * 1024 以上画布有 255 高、右列间距 53 > 42，继续用原图，桌面一处未改。 */}
      <div className="mx-auto max-w-[420px] lg:hidden">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {LEFT.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1.5 rounded-[4px] border border-white/85 bg-white/[0.72] px-2.5 py-1.5 text-[13px] font-[650] tracking-[-0.1px] text-ink"
            >
              <RouteMark name={item.mark} size={16} color={item.tint} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="mt-2 flex flex-col items-center">
          <span aria-hidden className="h-3 w-px bg-white/30" />
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white/85">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/tf-icon-black-512.png" alt="" width={24} height={24} className="h-6 w-6" />
          </span>
          <span aria-hidden className="h-3 w-px bg-white/30" />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {RIGHT.map((item) => (
            <span
              key={item.label}
              className="flex items-center justify-center gap-1.5 rounded-[4px] border border-white/85 bg-white/[0.72] px-2.5 py-1.5 text-[13px] font-[650] text-ink"
            >
              {item.mark ? (
                <RouteMark name={item.mark} size={16} color={item.tint} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.img} alt="" width={16} height={16} className="shrink-0" />
              )}
              <span className="min-w-0 truncate">{item.label}</span>
            </span>
          ))}
        </div>

        <p className="mt-2.5 text-center font-mono text-[11px] tracking-[0.04em] text-white/55">
          已支持 10+ Agent / 客户端
        </p>
      </div>

      <div className="relative mx-auto hidden aspect-[1300/340] w-full max-w-[1280px] lg:block">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1300 340"
          preserveAspectRatio="none"
        >
          {/*
            复现参考站 prototype-route.mjs 的三条关键设定：
            ① 底线透明度沿长度渐变——源端 0.16、中枢端 0.72（它用顶点 alpha，这里用 linearGradient 的 stopOpacity）；
            ② 流光是一道「柔边亮带」而不是硬 dash——外面一层 4.2px 模糊做辉光、里面一层 2px 实心，
               两层同相位同 delay，合起来才是它在 canvas 里那道流动的光；
            ③ 一道带约占管长 16%，速度 0.30 管/秒（≈3.3s 走完全程），与它一致。
          */}
          <defs>
            {LEFT.map((m, i) => (
              <linearGradient key={`bl-${i}`} id={`bl-${i}`} gradientUnits="userSpaceOnUse" x1="188" y1={LEFT_YS[i]} x2="652" y2="170">
                <stop offset="0" stopColor={m.tint} stopOpacity="0.1" />
                <stop offset="0.7" stopColor={m.tint} stopOpacity="0.45" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.8" />
              </linearGradient>
            ))}
            {RIGHT.map((m, i) => (
              <linearGradient key={`br-${i}`} id={`br-${i}`} gradientUnits="userSpaceOnUse" x1="1100" y1={RIGHT_YS[i]} x2="648" y2="170">
                <stop offset="0" stopColor={m.tint} stopOpacity="0.1" />
                <stop offset="0.7" stopColor={m.tint} stopOpacity="0.45" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.8" />
              </linearGradient>
            ))}
            {/* 光带窗口：黑→白→黑的横向渐变，沿 x 平移即「一段真渐变的光在线上扫过」 */}
            <linearGradient id="rd-band-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000000" />
              <stop offset="0.5" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#000000" />
            </linearGradient>
            {LEFT_YS.map((_, i) => (
              <mask key={`mk-l-${i}`} id={`mk-l-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1300" height="340">
                <rect className="rd-band" x="0" y="0" width="380" height="340" fill="url(#rd-band-grad)" style={{ animation: 'rd-band 3.3s linear infinite', animationDelay: `${i * 0.3}s` }} />
              </mask>
            ))}
            {RIGHT_YS.map((_, i) => (
              <mask key={`mk-r-${i}`} id={`mk-r-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1300" height="340">
                <rect className="rd-band" x="0" y="0" width="380" height="340" fill="url(#rd-band-grad)" style={{ animation: 'rd-band 3.3s linear infinite', animationDelay: `${0.15 + i * 0.3}s` }} />
              </mask>
            ))}
          </defs>
          {LEFT_YS.map((y, i) => {
            const d = `M188 ${y} C 450 ${y} 456 170 652 170`;
            const dl = `${i * 0.3}s`;
            return (
              <g key={`l-${y}`}>
                <path d={d} fill="none" stroke={`url(#bl-${i})`} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                {/* 亮带只在这段渐变窗口里可见：窗口内 0→1→0，所以两头是真淡出，不是被切平的棒子 */}
                <path d={d} fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" mask={`url(#mk-l-${i})`} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
          {RIGHT_YS.map((y, i) => {
            const d = `M648 170 C 812 170 852 ${y} 1100 ${y}`;
            const dl = `${0.15 + i * 0.3}s`;
            return (
              <g key={`r-${y}`}>
                <path d={d} fill="none" stroke={`url(#br-${i})`} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" mask={`url(#mk-r-${i})`} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>

        {/* 左上 / 右上标注：位置与文案照参考站（left 12% / right 9%，top 2% / -2.4%） */}
        <Note side="left" top="2%">
          全球模型直连
        </Note>
        <Note side="right" top="-2.4%">
          AGENT 客户端
        </Note>

        {/* 左列：三个模型 */}
        {LEFT.map((item, i) => (
          <Node key={item.label} side="left" top={LEFT_TOPS[i]} delay={140 + i * 110}>
            <RouteMark name={item.mark} size={23} color={item.tint} />
            <span className="min-w-0 truncate">{item.label}</span>
          </Node>
        ))}

        {/* 右列：四个 Agent 客户端 */}
        {RIGHT.map((item, i) => (
          <Node key={item.label} side="right" top={RIGHT_TOPS[i]} delay={220 + i * 110}>
            {item.mark ? (
              <RouteMark name={item.mark} size={23} color={item.tint} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.img} alt="" width={23} height={23} className="shrink-0" />
            )}
            <span className="min-w-0 truncate">{item.label}</span>
          </Node>
        ))}

        {/* 中枢柔光：深色星空底下这圈白光会变成一团灰雾，压到几乎看不见，
            只保留一点点「圆浮起来」的暗示（2026-11-16 改深底后调整） */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0) 72%)' }}
        />

        {/* 中枢呼吸波纹（两道错开，纯 CSS） */}
        {[0, 1].map((k) => (
          <div
            key={`pulse-${k}`}
            aria-hidden
            className="rd-pulse pointer-events-none absolute left-1/2 top-1/2 h-[78px] w-[78px] rounded-full border"
            style={{
              borderColor: 'rgba(77,107,254,0.35)',
              animation: `rd-pulse 3.6s ease-out ${k * 1.8}s infinite`,
            }}
          />
        ))}

        {/* 中枢：78px 圆 + 品牌标；文字挂在圆下方 */}
        <div
          className="absolute left-1/2 top-1/2 flex h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/90"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.80))',
            backdropFilter: 'blur(13px) saturate(1.25)',
            WebkitBackdropFilter: 'blur(13px) saturate(1.25)',
          }}
        >
          {/* 2026-11-16：中枢图标换成品牌新图形（蓝底方块 + 白色折线），与网站图标同一份素材 */}
          <img
            src="/brand/tf-icon-black-512.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10"
          />
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[12.5px] text-white/75" style={{ top: 'calc(50% + 56px)' }}>
          <i
            aria-hidden
            className="mr-1.5 inline-block align-middle"
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#E08A5B' }}
          />
          智能调度
        </span>

        {/* 右下：接入广度（先照参考站文案，接真实数据时改这一行） */}
        <span className="absolute right-[2%] font-mono text-[12.5px] tracking-[0.02em] text-white/55" style={{ bottom: -8 }}>
          已支持 10+ Agent / 客户端
        </span>
      </div>
    </>
  );
}
