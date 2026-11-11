/**
 * 模型目录（文档 4.1「模型数据应由经过整理的公开模型目录提供」）。
 *
 * 本文件只放后端 /api/pricing 不提供的编辑类信息：厂商、分类、用途、能力、介绍。
 * 模型是否存在、具体价格一律以后端 /api/pricing 为准，两边取交集后才展示——
 * 后台下线某个模型时，官网与控制台不用改代码也会同步消失。
 *
 * 2026-11-10 从 apps/website/lib 移到共享包：控制台的「模型广场」
 * （文档 4.2 B 要求模型分类与能力标签）需要同一份目录，两个前端不能各存一份。
 *
 * 资料来源：DeepSeek 官方「模型 & 价格」文档
 * https://api-docs.deepseek.com/zh-cn/quick_start/pricing/
 */

/** 分类用词按文档 4.2 B 给的示例 */
export type ModelCategory =
  | '通用对话'
  | '推理'
  | '编程'
  | '图像'
  | '视频'
  | 'Embedding'
  | '音频';

/** 分类固定顺序；页面只渲染真正有模型的分类 */
export const CATEGORY_ORDER: ModelCategory[] = [
  '通用对话',
  '推理',
  '编程',
  '图像',
  '视频',
  'Embedding',
  '音频',
];

export type ModelCatalogEntry = {
  /** 必须与后端 /api/pricing 返回的 model_name 完全一致 */
  id: string;
  displayName: string;
  vendorName: string;
  category: ModelCategory;
  /** 模型用途（文档 4.1 要求） */
  useCase: string;
  /** 模型能力标签（文档 4.1 / 4.2 要求） */
  capabilities: string[];
  /** 上下文长度 */
  contextWindow: string;
  /** 最大输出长度 */
  maxOutput: string;
  /** 模型详细介绍（文档 4.1 要求） */
  description: string;
};

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  {
    id: 'deepseek-flash',
    displayName: 'DeepSeek Flash',
    vendorName: 'DeepSeek',
    category: '通用对话',
    useCase: '日常对话、内容生成、图文理解、长文档处理',
    capabilities: ['思考模式', '工具调用', 'JSON 输出', '图像理解', '1M 上下文'],
    contextWindow: '1M',
    maxOutput: '384K',
    description:
      'DeepSeek-V4.1-Flash-1017。支持思考与非思考两种模式，可接收文本与图片输入，适合日常对话、内容生成、图文理解和长文档处理。',
  },
  {
    id: 'deepseek-v4-pro',
    displayName: 'DeepSeek V4 Pro',
    vendorName: 'DeepSeek',
    category: '通用对话',
    useCase: '复杂推理、长文档处理、高质量内容生成',
    capabilities: ['思考模式', '工具调用', 'JSON 输出', '对话前缀续写', '1M 上下文'],
    contextWindow: '1M',
    maxOutput: '384K',
    description:
      'DeepSeek-V4-Pro-0813。DeepSeek 旗舰模型，支持 1M 超长上下文与最高 384K 输出，适合复杂推理、长文档处理和高质量内容生成。',
  },
];

/** 按模型 id 查目录；后端有、目录里没有的模型返回 undefined */
export function findCatalogEntry(id: string): ModelCatalogEntry | undefined {
  return MODEL_CATALOG.find((entry) => entry.id === id);
}

/**
 * 后端有、目录里没有的模型：按名字推断厂商与分类，给一份兜底资料。
 *
 * 2026-11-11 加：目录原本是「白名单」，后台接了新模型官网却不显示，
 * 得回来改代码。改成「目录是补充」——认得的走目录，不认得的照样展示，
 * 只推断能从名字确定的两项（厂商、分类），描述与规格留空，页面自动隐藏，不编内容。
 */
const VENDOR_BY_PREFIX: ReadonlyArray<readonly [string, string]> = [
  ['deepseek', 'DeepSeek'],
  ['claude', 'Anthropic'],
  ['gpt', 'OpenAI'],
  ['o1', 'OpenAI'],
  ['o3', 'OpenAI'],
  ['o4', 'OpenAI'],
  ['gemini', 'Google'],
  ['qwen', '通义千问'],
  ['glm', '智谱 GLM'],
  ['kimi', 'Kimi'],
  ['minimax', 'MiniMax'],
  ['mimo', 'MiMo'],
  ['hunyuan', '腾讯混元'],
  ['hy', '腾讯混元'],
  ['doubao', '豆包'],
  ['ernie', '文心'],
  ['grok', 'xAI'],
  ['llama', 'Meta'],
  ['mistral', 'Mistral'],
];

function inferVendor(id: string): string {
  const lower = id.toLowerCase();
  for (const [prefix, vendor] of VENDOR_BY_PREFIX) {
    if (lower.startsWith(prefix)) return vendor;
  }
  return '其他厂商';
}

function inferCategory(id: string): ModelCategory {
  const lower = id.toLowerCase();
  if (lower.includes('embed')) return 'Embedding';
  if (lower.includes('video')) return '视频';
  if (lower.includes('image') || lower.includes('vision') || lower.includes('-vl')) return '图像';
  if (lower.includes('audio') || lower.includes('tts') || lower.includes('whisper')) return '音频';
  if (lower.includes('code') || lower.includes('coder')) return '编程';
  if (lower.includes('reason') || lower.includes('think')) return '推理';
  return '通用对话';
}

/** 品牌词按厂商官方写法显示，其余片段只做首字母大写 */
const DISPLAY_TOKEN: Record<string, string> = {
  deepseek: 'DeepSeek',
  glm: 'GLM',
  kimi: 'Kimi',
  qwen: 'Qwen',
  mimo: 'MiMo',
  minimax: 'MiniMax',
  gpt: 'GPT',
  claude: 'Claude',
  gemini: 'Gemini',
};

/** `kimi-k2.7-code` → `Kimi K2.7 Code`，只调整大小写与品牌写法，不改写语义 */
function inferDisplayName(id: string): string {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => DISPLAY_TOKEN[part.toLowerCase()] ?? part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** 目录里有就用目录的，没有就按名字兜底——官网与控制台都走这里 */
export function resolveCatalogEntry(id: string): ModelCatalogEntry {
  const known = findCatalogEntry(id);
  if (known) return known;

  return {
    id,
    displayName: inferDisplayName(id),
    vendorName: inferVendor(id),
    category: inferCategory(id),
    useCase: '',
    capabilities: [],
    contextWindow: '',
    maxOutput: '',
    description: '',
  };
}