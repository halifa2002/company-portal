/**
 * 页面质量审计（2026-11-14）
 *
 * 零依赖，跑在本地 dev server 上。做两件事：
 *   1. 静态可访问性 / SEO：标题层级、alt、可访问名称、表单标签、meta
 *   2. 颜色对比度：按 design-tokens 真实色值算 WCAG 对比度
 *
 * 为什么不用 Lighthouse：Lighthouse 要 Chrome + 一层 puppeteer，报错路径长、
 * 启动一次几十秒；这两类问题用静态检查能第一时间拦住，CI 里也跑得快。
 * 需要性能/LCP 这类真实渲染指标时再用 Lighthouse（见 docs 里的用法）。
 *
 * 用法：
 *   bun scripts/audit.mjs                          # 默认审预览页
 *   bun scripts/audit.mjs http://127.0.0.1:4101/   # 审正式首页
 */

const DEFAULT_URL = 'http://127.0.0.1:4101/preview/home';

/* ---------------------------------------------------------------- 对比度 */

const TOKENS = {
  ink: '#06223f',
  'ink-soft': '#123a52',
  'ink-mid': '#45647a',
  'ink-muted': '#5f7586',
  'brand-300': '#7ccbff',
  'brand-400': '#38b1ff',
  'brand-500': '#188df9',
  'brand-700': '#0a6bd2',
  'brand-900': '#0d3a6e',
  'accent-warm': '#e8a33d',
  surface: '#ffffff',
  'surface-subtle': '#f4fafe',
  'brand-50': '#eff8ff',
  'brand-950': '#0a3a5f',
  code: '#0a1929',
};

/** 真实会同时出现的「前景 on 背景」组合；文字组合按 4.5:1 判 */
const TEXT_PAIRS = [
  ['ink', 'surface'],
  ['ink', 'surface-subtle'],
  ['ink-soft', 'surface'],
  ['ink-mid', 'surface'],
  ['ink-mid', 'surface-subtle'],
  ['ink-muted', 'surface'],
  ['ink-muted', 'surface-subtle'],
  ['brand-700', 'surface'],
  ['brand-700', 'surface-subtle'],
  ['brand-700', 'brand-50'],
  ['brand-900', 'surface'],
  ['brand-300', 'brand-950'],
  ['brand-400', 'brand-950'],
  ['brand-300', 'code'],
  // 顶部通告条（深色条）：暖橙强调文字
  ['accent-warm', 'code'],
  // 预览页 v9 首屏背景（2026-11-14）：底图由 scripts/gen-hero-bg.py 生成，这里列的是
  // 图里「文字会落在」的最暗一段——暖版 #e5c5b7（两颗小标签处）、蓝版 #d3e6ff。
  // 结论：暖版上 **ink-mid 只有 3.9:1，不达标**，所以路由图的 11px 小标签改用 ink-soft
  // （8.66 / 7.42，远超 4.5）；蓝版上 ink-mid 勉强 4.95，仍建议小字用 ink-soft。
  ['ink', '#e5c5b7'],
  ['ink-soft', '#e5c5b7'],
  ['ink', '#d3e6ff'],
  ['ink-soft', '#d3e6ff'],
  ['ink-mid', '#d3e6ff'],
  // 转化带（2026-11-15 改深海军蓝 #0a3a5f）。带上的字是三档白：标题纯白、
  // 说明 text-white/85、步骤行 text-white/70——后两档是把白按透明度压在该底色上的
  // 实际观感色（#dae1e7 / #b6c4cf），按 4.5:1 一并卡住，免得以后调透明度把对比度压穿。
  ['#ffffff', 'brand-950'],
  ['#dae1e7', 'brand-950'],
  ['#b6c4cf', 'brand-950'],
  // 转化带（2026-11-15 去掉照片层后是纯渐变）：最亮的一端是 #0e4979，
  // 白按钮就压在这里，所以真正的短板是这个色，不是 brand-950。压 70% 的白另算一档。
  ['#ffffff', '#0e4979'],
  ['#b7c8d7', '#0e4979'],
];

const hex2rgb = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
const luminance = (h) => {
  const [r, g, b] = hex2rgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

function auditContrast() {
  const fails = [];
  // 允许直接写十六进制色：暖色梯级还没进 TOKENS，先按裸色值核对
  const resolve = (key) => TOKENS[key] ?? key;
  console.log('\n【对比度】阈值 4.5:1（正文标准）');
  for (const [fg, bg] of TEXT_PAIRS) {
    const ratio = contrast(resolve(fg), resolve(bg));
    const pass = ratio >= 4.5;
    if (!pass) fails.push(`${fg} on ${bg} = ${ratio.toFixed(2)}:1`);
    console.log(`${pass ? '  ✔' : '  ✘'} ${`${fg} on ${bg}`.padEnd(30)} ${ratio.toFixed(2)}:1`);
  }
  return fails;
}

/* ------------------------------------------------------- 静态可访问性 */

function auditPage(html) {
  const fails = [];
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const checks = [];
  const add = (name, pass, detail) => checks.push({ name, pass, detail });

  add('html lang 属性', /<html[^>]+lang="[^"]+"/i.test(html), '缺少 lang');

  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  add('title 存在', title.length > 0, '缺少 <title>');
  add('title 长度 15–60', title.length >= 15 && title.length <= 60, `当前 ${title.length} 字`);

  const desc = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ?? '';
  add('meta description', desc.length >= 20, '缺少或过短');

  add('viewport meta', /<meta[^>]+name="viewport"/i.test(html), '缺少 viewport');

  const headings = [...body.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    level: Number(m[1][1]),
    text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 50),
  }));
  const h1s = headings.filter((h) => h.level === 1);
  add('恰好一个 h1', h1s.length === 1, `发现 ${h1s.length} 个`);

  let lastLevel = 0;
  const skips = [];
  for (const h of headings) {
    if (lastLevel > 0 && h.level > lastLevel + 1) skips.push(`h${lastLevel}→h${h.level}（${h.text}）`);
    lastLevel = h.level;
  }
  add('标题层级不跳跃', skips.length === 0, skips.join('；'));

  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\balt=/i.test(t));
  add('图片都有 alt', noAlt.length === 0, `${noAlt.length}/${imgs.length} 张缺 alt`);

  const anchors = [...body.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)];
  const emptyAnchors = anchors.filter((m) => {
    const tag = m[0].slice(0, m[0].indexOf('>') + 1);
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, '').trim();
    return text.length === 0 && !/aria-label=|title=/.test(tag);
  });
  add('链接都有可访问名称', emptyAnchors.length === 0, `${emptyAnchors.length} 个空链接`);

  const buttons = [...body.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)];
  const emptyButtons = buttons.filter((m) => {
    const tag = m[0].slice(0, m[0].indexOf('>') + 1);
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, '').trim();
    return text.length === 0 && !/aria-label=|title=/.test(tag);
  });
  add('按钮都有可访问名称', emptyButtons.length === 0, `${emptyButtons.length} 个空按钮`);

  const inputs = [...body.matchAll(/<(input|select|textarea)\b[^>]*>/gi)].map((m) => m[0]);
  const unlabeled = inputs.filter((tag) => {
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    const labelled =
      /aria-label=|aria-labelledby=/.test(tag) || (id && html.includes(`for="${id}"`));
    const excluded = /type="hidden"/.test(tag) || /sr-only/.test(tag);
    return !labelled && !excluded;
  });
  add('表单控件都有标签', unlabeled.length === 0, `${unlabeled.length} 个无标签`);

  console.log('\n【可访问性 / SEO】');
  for (const c of checks) {
    if (!c.pass) fails.push(`${c.name}：${c.detail}`);
    console.log(`${c.pass ? '  ✔' : '  ✘'} ${c.name}${c.pass ? '' : ` — ${c.detail}`}`);
  }
  console.log(
    `\n  统计：标题 ${headings.length}（h1×${h1s.length}）· 图片 ${imgs.length} · 链接 ${anchors.length} · 按钮 ${buttons.length} · 表单 ${inputs.length}`,
  );
  return fails;
}

/* ------------------------------------------------------------ 主流程 */

const url = process.argv[2] || DEFAULT_URL;

let html = '';
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  html = await res.text();
  console.log(`审计目标：${url}（HTML ${(html.length / 1024).toFixed(0)} KB）`);
} catch (err) {
  console.error(`无法抓取 ${url}：${err.message}`);
  console.error('先确认 dev server 在跑：bun run dev:website');
  process.exit(2);
}

const pageFails = auditPage(html);
const contrastFails = auditContrast();
const all = [...pageFails, ...contrastFails];

if (all.length === 0) {
  console.log('\n全部通过。');
  process.exit(0);
}

console.log(`\n共 ${all.length} 项不达标：`);
for (const item of all) console.log('  ·', item);
process.exit(1);
