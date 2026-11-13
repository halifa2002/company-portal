'use client';

/**
 * 首页的「网关拓扑图」——这是这个平台自己的解释，不是抄来的装饰�? *
 * 左边三路上游（DeepSeek / GLM / Kimi），中间是平台节点，右边两种调用端 * （应用、客户端）。线是三次贝塞尔，沿线跑一道光，表示请求在走�? *
 * 三个原则�? * 1. 它必须说真话：左边只有真接了的厂牌，右边只有真能对接的东西，
 *    节点上写「统一接口」，因为协议兼容确实是本平台在做的事�? * 2. 它必须能读：线比字细，点比线重，文字比点更重——层级从上往下压�? * 3. 它必须不炫技：纯 SVG + CSS 动画，不�?WebGL�? *
 * tone�? * light = 浅底页面用（白卡 + 深字�? * dark  = 深色整幅里用（半透明�?+ 白字）。深底上白底卡会像贴纸，
 *         所以深色档把卡片换�?6% 白的半透明底、描边提�?16% 白，
 *         但中间那个平台节点仍然保持白色——它是这张图的焦点�? */

const W = 560;
const H = 460;

/**
 * 中间平台节点
 *
 * 2026-11-13 第七版：整张图从竖构图改成横构图。
 * 原来 viewBox 是 360×312（接近 1:1），放进首屏一放大，
 * 节点卡变成 180 宽、字 26px，比副标题还大，图把标题压住了。
 * 现在横轴拉到 600、纵轴收到 250，同一显示宽度下字号回到 14–15，
 * 图才回到「说明图」的位置。
 */
const HUB = { x: 320, y: 225, rx: 56, ry: 56 };

type Node = { id: string; label: string; sub?: string; y: number };

const UPSTREAM: Node[] = [
  { id: 'deepseek', label: 'DeepSeek', sub: '对话 · 推理', y: 145 },
  { id: 'glm', label: 'GLM', sub: '多模态', y: 225 },
  { id: 'kimi', label: 'Kimi', sub: '长上下文', y: 305 },
];

const CLIENT: Node[] = [
  { id: 'app', label: '你的应用', sub: 'Chat / RAG', y: 172 },
  { id: 'agent', label: '编程助手', sub: '编辑器内调用', y: 278 },
];

/** 三次贝塞尔：�?(x1,y) 水平出发，到 (x2,y) 水平收尾，中间留出弯 */
function curve(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

const LEFT_X = 110;
const RIGHT_X = 530;
const HUB_LEFT = HUB.x - HUB.rx;
const HUB_RIGHT = HUB.x + HUB.rx;

export function GatewayGraph({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  const chipFill = dark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const chipStroke = dark ? 'rgba(255,255,255,0.16)' : '#e7e9ef';
  const labelFill = dark ? '#f8fafc' : '#101828';
  const subFill = dark ? 'rgba(255,255,255,0.52)' : '#667085';
  /* 两侧小标题原来 #98a2b3，白底上几乎读不出来，压深一档 */
  const noteFill = dark ? 'rgba(255,255,255,0.45)' : '#8592a6';

  return (
    <div className="relative">
      {/* 节点背后的柔光：把中间那块烘出来，但不做成一团发光的�?*/}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background: dark
            ? 'radial-gradient(circle, rgba(94,150,204,0.35) 0%, rgba(6,24,37,0) 70%)'
            : 'radial-gradient(circle, rgba(94,150,204,0.28) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      <svg
        viewBox="20 100 600 250"
        className="relative w-full"
        role="img"
        aria-label="上游模型经平台统一网关接入，再提供给应用与编程助手"
      >
        <defs>
          {/* 一根线从「上游侧」到「客户端侧」的渐变：靛�?�?天蓝 */}
          {/*
            2026-11-13 修的真 bug：gradientUnits 默认是 objectBoundingBox，
            而中间那行 GLM 的两条线是纯水平直线（首尾 y 相同），包围盒高度为 0，
            渐变容器退化，整条 path 根本不渲染——截图上那一行只剩一小段闪过的光，
            看着像线断了。改成 userSpaceOnUse 给绝对坐标才能画出来。
          */}
          <linearGradient
            id="flow-in"
            gradientUnits="userSpaceOnUse"
            x1={LEFT_X + 42}
            y1="0"
            x2={HUB_LEFT - 4}
            y2="0"
          >
            <stop offset="0%" stopColor="#93bae0" stopOpacity="0.15" />
            <stop offset="55%" stopColor="#3a78b4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1b5aa0" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient
            id="flow-out"
            gradientUnits="userSpaceOnUse"
            x1={HUB_RIGHT + 4}
            y1="0"
            x2={RIGHT_X - 42}
            y2="0"
          >
            <stop offset="0%" stopColor="#1b5aa0" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="hub-fill" cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="58%" stopColor="#f4f5ff" />
            <stop offset="100%" stopColor="#dfe3ff" />
          </radialGradient>
          <filter id="hub-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#312e81" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* ---------- 连线 ---------- */}
        <g fill="none" strokeWidth="1.4">
          {UPSTREAM.map((node) => (
            <path
              key={`in-${node.id}`}
              d={curve(LEFT_X + 42, node.y, HUB_LEFT - 4, HUB.y + (node.y - HUB.y) * 0.28)}
              stroke="url(#flow-in)"
            />
          ))}
          {CLIENT.map((node) => (
            <path
              key={`out-${node.id}`}
              d={curve(HUB_RIGHT + 4, HUB.y + (node.y - HUB.y) * 0.28, RIGHT_X - 42, node.y)}
              stroke="url(#flow-out)"
            />
          ))}
        </g>

        {/*
          沿线跑的光：�?stroke-dasharray 画一段短弧，再让它沿路径走�?          不引动画库——这�?CSS 只占几行，且能被「减少动画」设置一刀关掉�?        */}
        <g fill="none" strokeWidth="2.6" strokeLinecap="round">
          {UPSTREAM.map((node, index) => (
            <path
              key={`pulse-in-${node.id}`}
              d={curve(LEFT_X + 42, node.y, HUB_LEFT - 4, HUB.y + (node.y - HUB.y) * 0.28)}
              stroke="#3a78b4"
              pathLength={100}
              strokeDasharray="9 91"
              className="gateway-pulse"
              style={{ animationDelay: `${index * 0.9}s` }}
            />
          ))}
          {CLIENT.map((node, index) => (
            <path
              key={`pulse-out-${node.id}`}
              d={curve(HUB_RIGHT + 4, HUB.y + (node.y - HUB.y) * 0.28, RIGHT_X - 42, node.y)}
              stroke="#38bdf8"
              pathLength={100}
              strokeDasharray="9 91"
              className="gateway-pulse gateway-pulse-out"
              style={{ animationDelay: `${0.45 + index * 0.9}s` }}
            />
          ))}
        </g>

        {/* ---------- 中间节点 ---------- */}
        <g filter="url(#hub-shadow)">
          <ellipse cx={HUB.x} cy={HUB.y} rx={HUB.rx} ry={HUB.ry} fill="url(#hub-fill)" />
          {/* 一圈很细的外环，给节点加一道「金属边�?*/}
          <ellipse
            cx={HUB.x}
            cy={HUB.y}
            rx={HUB.rx}
            ry={HUB.ry}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </g>
        {/* 慢速旋转的虚线环：唯一的「活」的痕迹，转速很慢，不抢�?*/}
        <ellipse
          cx={HUB.x}
          cy={HUB.y}
          rx={HUB.rx + 16}
          ry={HUB.ry + 16}
          fill="none"
          stroke={dark ? 'rgba(194,217,238,0.55)' : '#c2d9ee'}
          strokeWidth="1"
          strokeDasharray="2 8"
          className="gateway-ring"
          style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
        />
        <g>
          {/*
            中心图形�?026-11-13 换掉）：原来是一个圆圈加两道横线—�?            读起来像"用户头像"或�?菜单按钮"，跟网关没有任何关系，用户直接说"好土"�?            现在换成品牌自己那个 Z 折线（与页头 logo 同一个路径）�?            这个节点就不再是一个通用符号，而是"我们的网�?�?            路径来自 packages/ui �?LogoMark，改品牌图形时两边要一起改�?          */}
          {/*
            居中偏移要按「缩放后的包围盒」算，不能只减半宽：
            Z 路径本身起点�?(6,7) 不是 (0,0)，缩�?1.7 后左边界跑到 10.2�?            正确写法：t = 目标中心 - 缩放后包围盒中心
              x: HUB.x - (6 + 18)/2 * 1.7 = HUB.x - 20.4
              y: (HUB.y - 8) - (7 + 17)/2 * 1.7 = HUB.y - 28.4
            上一版只减了 10.2，图标整体右�?10px，看着就是"歪了"�?          */}
          <g transform={`translate(${HUB.x - 20.4} ${HUB.y - 31.4}) scale(1.7)`}>
            <path
              d="M6 7h12L6 17h12"
              fill="none"
              stroke="#14477f"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <text
            x={HUB.x}
            y={HUB.y + 22}
            textAnchor="middle"
            fill="#312e81"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}
          >
            统一接口
          </text>
        </g>

        {/* ---------- 上游 ---------- */}
        {UPSTREAM.map((node) => (
          <g key={node.id}>
            <rect
              x={LEFT_X - 42}
              y={node.y - 22}
              width={84}
              height={44}
              rx={11}
              fill={chipFill}
              stroke={chipStroke}
              strokeWidth="1"
            />
            <text
              x={LEFT_X}
              y={node.y - 3}
              textAnchor="middle"
              fill={labelFill}
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              {node.label}
            </text>
            <text
              x={LEFT_X}
              y={node.y + 12}
              textAnchor="middle"
              fill={subFill}
              style={{ fontSize: 9.5 }}
            >
              {node.sub}
            </text>
          </g>
        ))}

        {/* ---------- 客户�?---------- */}
        {CLIENT.map((node) => (
          <g key={node.id}>
            <rect
              x={RIGHT_X - 42}
              y={node.y - 22}
              width={84}
              height={44}
              rx={11}
              fill={chipFill}
              stroke={chipStroke}
              strokeWidth="1"
            />
            <text
              x={RIGHT_X}
              y={node.y - 3}
              textAnchor="middle"
              fill={labelFill}
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              {node.label}
            </text>
            <text
              x={RIGHT_X}
              y={node.y + 12}
              textAnchor="middle"
              fill={subFill}
              style={{ fontSize: 9.5 }}
            >
              {node.sub}
            </text>
          </g>
        ))}

        {/* ---------- 两侧的小标题 ---------- */}
        <text
          x={LEFT_X}
          y={UPSTREAM[0].y - 40}
          textAnchor="middle"
          fill={noteFill}
          style={{ fontSize: 9.5, letterSpacing: '0.14em' }}
        >
          上游模型
        </text>
        <text
          x={RIGHT_X}
          y={CLIENT[0].y - 40}
          textAnchor="middle"
          fill={noteFill}
          style={{ fontSize: 9.5, letterSpacing: '0.14em' }}
        >
          调用端        </text>
      </svg>
    </div>
  );
}