/**
 * 品牌设计变量（JS 侧取色用）
 *
 * ⚠️ 真正的唯一真源是 `theme.css`：页面样式走 CSS 变量，不是走这个文件。
 * 本文件只给「需要在 JS 里拿到色值」的场合（图表、canvas、内联样式）用。
 * 2026-11-16 已按 theme.css 现值对齐——此前这里还停在靛蓝 #4F46E5，
 * 与线上实际使用的 #188DF9 对不上，属于「两份真源」，已修。
 *
 * 全站颜色、字号、间距、圆角、阴影都在这个包里，禁止各页面自己写死（md 7.2）。
 *
 * 配色依据 md 第七章 7.1：
 *   「蓝色或靛蓝色作为品牌强调色，具体色值由设计阶段确定」
 */

export const brand = {
  /** 主色：按钮、链接、选中态 */
  primary: '#188DF9',
  /** 主色悬停 */
  primaryHover: '#0A74E0',
  /** 主色浅底：标签、选中背景 */
  primarySoft: '#E3F3FF',
  /** 强调色：渐变收尾 */
  accent: '#38B1FF',
  /** 首屏渐变起点（左上） */
  heroFrom: '#F4FAFF',
  /** 首屏渐变终点（右下） */
  heroTo: '#E3F3FF',
} as const;

/** 深色卡片配色（用于对比色块） */
export const dark = {
  /** 深色卡片底 */
  surface: '#0A3A5F',
  /** 深色卡片上的标题 */
  text: '#FFFFFF',
  /** 深色卡片上的正文 */
  textMuted: 'rgba(255,255,255,0.72)',
} as const;

/**
 * 字号：只有六档（md 7.2 要求字号进设计变量）
 *
 * 之前全站 18 种字号，其中 11.5 / 12.5 / 13.5 / 14.5 这类半像素值 34 处。
 * 半像素字号在普通屏渲染会发虚，而 18 种字号等于没有层级。
 * 新增字号＝先来这里加档位，不许在页面里写 text-[15px]。
 */
export const typography = {
  meta: 12,
  note: 13,
  body: 14,
  title: 16,
  heading: 20,
  display: 28,
  leading: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

/** 间距：4 的倍数，命名档位给页面引用，避免同一页出现 20/24/28/32 乱跳 */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  card: 24,
  block: 32,
  page: 24,
} as const;

/**
 * 圆角只有三档：控件 8 / 卡片 12 / 弹窗 16。
 * 原来 11/12/18/20/24 五种写法混用，「适度圆角」变成「每块随便圆」。
 */
export const radius = {
  control: 8,
  card: 12,
  panel: 16,
  /** 仅官网营销页大色块使用，控制台不用 */
  hero: 24,
} as const;

/** 语义色三件套：实色（图标）/ 深字（文字）/ 浅底（标签） */
export const semantic = {
  success: { solid: '#16A34A', text: '#067647', soft: '#ECFDF3' },
  warning: { solid: '#D97706', text: '#B54708', soft: '#FFFAEB' },
  danger: { solid: '#DC2626', text: '#B42318', soft: '#FEF3F2' },
  info: { solid: '#2563EB', text: '#175CD3', soft: '#EFF8FF' },
} as const;

/**
 * 文字四档实色。
 * 不用「黑色 + 透明度」：透明度叠在不同底色上深浅不一，同一页两处说明文字
 * 看着不是一档。
 */
export const text = {
  strong: '#06223F',
  soft: '#123A52',
  mid: '#45647A',
  /* 2026-11-14：与 theme.css 的 --neutral-text-muted 对齐，并满足 4.5:1 正文对比度 */
  muted: '#5F7586',
  inverse: '#FFFFFF',
} as const;

/** 边框：全站一档，页面里不许再写 border-black/5 或 border-gray-200 */
export const line = '#E7E9EF' as const;

/**
 * 品牌图形方块（2026-11-16）
 *
 * 官方标志是黑底白折线，方块底色必须和 public/brand/tf-icon-black-*.png 一致，
 * 否则组件里的方块与图标文件会有色差。按 md 7.2 走变量，不在页面写死。
 */
export const logo = {
  /** 方块底：与图标 PNG 的黑底同值 */
  tile: '#0F0F10',
  /** 反色方块底（备选白底方案用） */
  tileInverse: '#FFFFFF',
} as const;

/** 内容最大宽度：宽屏下不再让表格被拉成一米长 */
export const layout = {
  contentMaxWidth: 1440,
  topbarHeight: 64,
  sidebarWidth: 224,
} as const;

