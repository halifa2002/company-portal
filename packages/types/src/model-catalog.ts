/**
 * 模型目录（文档 4.1「模型数据应由经过整理的公开模型目录提供」）。
 *
 * 本文件只放后端 /api/pricing 不提供的编辑类信息：厂商、分类、用途、能力、介绍。
 * 模型是否存在、具体价格一律以后端 /api/pricing 为准：
 * 目录里有就补充资料，没有就按名字兜底（见 resolveCatalogEntry），后台接完模型官网不会漏。
 *
 * 2026-11-10 从 apps/website/lib 移到共享包：控制台的「模型广场」
 * （文档 4.2 B 要求模型分类与能力标签）需要同一份目录，两个前端不能各存一份。
 *
 * 2026-11-13 按平台实际接入的 27 个模型重写。写作纪律：
 *   - 只写能从模型命名与厂商公开定位确定的内容；上下文长度、输出上限等具体规格
 *     一律留空（页面自动隐藏），不编数字——文档 4.2 B 只允许展示「实际接入并验证」的能力。
 *   - 能力标签只用平台侧能保证的三项（流式输出、工具调用、OpenAI 兼容），
 *     加一项与用途直接相关的（如编程模型的「代码生成」）。
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
  /** 上下文长度；未核实的一律留空 */
  contextWindow: string;
  /** 最大输出长度；未核实的留空 */
  maxOutput: string;
  /** 模型详细介绍（文档 4.1 要求） */
  description: string;
};

/** 平台侧对所有模型都能保证的三项能力，进目录时统一带上 */
const BASE_CAPS = ['流式输出', '工具调用', 'OpenAI 兼容'];

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  /* ---------------------------- OpenAI ---------------------------- */
  {
    id: 'codex-auto-review',
    displayName: 'Codex Auto Review',
    vendorName: 'OpenAI',
    category: '编程',
    useCase: '代码审查、缺陷定位、补丁建议',
    capabilities: [...BASE_CAPS, '代码生成', '代码审查'],
    contextWindow: '',
    maxOutput: '',
    description:
      '面向代码审查场景的模型，适合对提交内容做缺陷定位与修改建议。接入后在 IDE 或 CI 里直接调用即可。',
  },
  {
    id: 'gpt-5.6-luna',
    displayName: 'GPT-5.6 Luna',
    vendorName: 'OpenAI',
    category: '通用对话',
    useCase: '日常问答、内容生成、轻量任务',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GPT-5.6 系列中的轻量档，响应快、调用成本低，适合日常问答与批量内容生成。',
  },
  {
    id: 'gpt-5.6-sol',
    displayName: 'GPT-5.6 Sol',
    vendorName: 'OpenAI',
    category: '通用对话',
    useCase: '通用对话、写作、信息整理',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GPT-5.6 系列的标准档，能力与成本平衡，适合作为业务的默认对话模型。',
  },
  {
    id: 'gpt-5.6-terra',
    displayName: 'GPT-5.6 Terra',
    vendorName: 'OpenAI',
    category: '通用对话',
    useCase: '复杂任务、长内容生产、多轮对话',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GPT-5.6 系列的高配档，适合对输出质量要求更高的复杂任务与长内容生产。',
  },
  {
    id: 'gpt-6-astra',
    displayName: 'GPT-6 Astra',
    vendorName: 'OpenAI',
    category: '通用对话',
    useCase: '高难度任务、专业内容、复杂推理',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GPT-6 系列的高端档，面向对准确性要求高的专业场景，单次调用成本也最高。',
  },
  {
    id: 'gpt-6-luna',
    displayName: 'GPT-6 Luna',
    vendorName: 'OpenAI',
    category: '通用对话',
    useCase: '日常问答、内容生成、成本敏感场景',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GPT-6 系列的轻量档，用来在保持第六代质量的前提下压低单次调用成本。',
  },
  {
    id: 'gpt-6-sol',
    displayName: 'GPT-6 Sol',
    vendorName: 'OpenAI',
    category: '通用对话',
    useCase: '通用对话、业务集成、内容生产',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GPT-6 系列的标准档，适合作为第六代模型的主力选择。',
  },
  {
    id: 'gpt-6.1-sol',
    displayName: 'GPT-6.1 Sol',
    vendorName: 'OpenAI',
    category: '通用对话',
    useCase: '通用对话、业务集成、长会话',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GPT-6.1 的标准档，在 GPT-6 Sol 基础上迭代，适合替换旧代码里的 model 字段直接升级。',
  },
  {
    id: 'gpt-6.1-terra',
    displayName: 'GPT-6.1 Terra',
    vendorName: 'OpenAI',
    category: '通用对话',
    useCase: '高质量写作、复杂分析、专业问答',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GPT-6.1 的高配档，面向高质量写作与复杂分析，价格是当前目录里最高的一档。',
  },

  /* ---------------------------- DeepSeek ---------------------------- */
  {
    id: 'deepseek-v4.1-flash',
    displayName: 'DeepSeek V4.1 Flash',
    vendorName: 'DeepSeek',
    category: '通用对话',
    useCase: '日常对话、内容生成、长文档处理',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'DeepSeek V4.1 的快速版，主打高吞吐与低成本，适合日常对话和批量任务。',
  },
  {
    id: 'deepseek-v4.1-flash-1017',
    displayName: 'DeepSeek V4.1 Flash 1017',
    vendorName: 'DeepSeek',
    category: '通用对话',
    useCase: '日常对话、内容生成、图文理解',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'DeepSeek V4.1 Flash 的 1017 版本，同一档位的具体快照，行为与价格以接入版本为准。',
  },
  {
    id: 'deepseek-v4-flash-0731',
    displayName: 'DeepSeek V4 Flash 0731',
    vendorName: 'DeepSeek',
    category: '通用对话',
    useCase: '日常对话、批量调用、成本敏感场景',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'DeepSeek V4 Flash 的版本快照，价格最低的一档，适合大批量、低要求的调用。',
  },
  {
    id: 'deepseek-v4-pro-0813',
    displayName: 'DeepSeek V4 Pro 0813',
    vendorName: 'DeepSeek',
    category: '推理',
    useCase: '复杂推理、长文档处理、高质量内容生成',
    capabilities: [...BASE_CAPS, '深度推理'],
    contextWindow: '',
    maxOutput: '',
    description: 'DeepSeek V4 Pro 的版本快照，面向需要多步推理与长文档处理的任务。',
  },

  /* ---------------------------- 智谱 GLM ---------------------------- */
  {
    id: 'glm-5',
    displayName: 'GLM-5',
    vendorName: '智谱 GLM',
    category: '通用对话',
    useCase: '中文问答、内容生成、企业知识库',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: '智谱 GLM-5 的基础档，中文理解与生成表现稳定，适合企业知识库与办公场景。',
  },
  {
    id: 'glm-5.1',
    displayName: 'GLM-5.1',
    vendorName: '智谱 GLM',
    category: '通用对话',
    useCase: '中文问答、内容生成、多轮对话',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GLM-5 系列的小版本迭代，中文场景表现稳定，适合作为默认对话模型。',
  },
  {
    id: 'glm-5.2',
    displayName: 'GLM-5.2',
    vendorName: '智谱 GLM',
    category: '通用对话',
    useCase: '中文问答、内容生成、业务集成',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GLM-5 系列的中间版本，在 5.1 基础上迭代，适合替换 model 字段直接升级。',
  },
  {
    id: 'glm-5.3',
    displayName: 'GLM-5.3',
    vendorName: '智谱 GLM',
    category: '通用对话',
    useCase: '高质量中文写作、复杂问答、业务集成',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GLM-5 系列当前的主推版本，中文写作与复杂问答表现更好，价格略高于 5.1 / 5.2。',
  },
  {
    id: 'glm-5.3-flashx',
    displayName: 'GLM-5.3 FlashX',
    vendorName: '智谱 GLM',
    category: '通用对话',
    useCase: '高频调用、内容生成、成本敏感场景',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'GLM-5.3 的加速版，用一部分质量换响应速度和单价，适合高并发、低延迟场景。',
  },

  /* ---------------------------- Kimi ---------------------------- */
  {
    id: 'kimi-k2.7-code',
    displayName: 'Kimi K2.7 Code',
    vendorName: 'Kimi',
    category: '编程',
    useCase: '代码生成、仓库级改代码、命令行智能体',
    capabilities: [...BASE_CAPS, '代码生成', '代码审查'],
    contextWindow: '',
    maxOutput: '',
    description: '面向编程场景的 Kimi 模型，适合接进 Claude Code、Codex 这类编程智能体跑仓库级任务。',
  },
  {
    id: 'kimi-k2.8',
    displayName: 'Kimi K2.8',
    vendorName: 'Kimi',
    category: '通用对话',
    useCase: '长文档阅读、资料整理、通用问答',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'Kimi K2.8，长文本处理是它的强项，适合读长文档、整理资料与通用问答。',
  },
  {
    id: 'kimi-k3',
    displayName: 'Kimi K3',
    vendorName: 'Kimi',
    category: '通用对话',
    useCase: '长文档分析、复杂问答、内容生成',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'Kimi K3 是月之暗面的新一代模型，适合长文档分析与复杂问答，价格高于 K2.8。',
  },

  /* ---------------------------- 通义千问 ---------------------------- */
  {
    id: 'qwen3.7-max',
    displayName: 'Qwen3.7 Max',
    vendorName: '通义千问',
    category: '通用对话',
    useCase: '中文问答、复杂任务、业务集成',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: '通义千问 Max 系列，旗舰定位，适合对中文质量要求较高的业务场景。',
  },
  {
    id: 'qwen3.8-max',
    displayName: 'Qwen3.8 Max',
    vendorName: '通义千问',
    category: '通用对话',
    useCase: '中文问答、复杂任务、长内容生产',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: '通义千问 Max 系列的新版本，在 3.7 基础上迭代，适合替换 model 字段直接升级。',
  },

  /* ---------------------------- MiniMax ---------------------------- */
  {
    id: 'minimax-m3',
    displayName: 'MiniMax M3',
    vendorName: 'MiniMax',
    category: '通用对话',
    useCase: '日常问答、内容生成、角色对话',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'MiniMax M3，价格档位较低，适合对话类应用与批量内容生成。',
  },

  /* ---------------------------- MiMo ---------------------------- */
  {
    id: 'mimo-v2.5-pro',
    displayName: 'MiMo V2.5 Pro',
    vendorName: 'MiMo',
    category: '通用对话',
    useCase: '通用问答、内容生成、业务集成',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'MiMo V2.5 Pro，标准档，适合作为通用问答与内容生成的主力模型。',
  },
  {
    id: 'mimo-v2.6-flash',
    displayName: 'MiMo V2.6 Flash',
    vendorName: 'MiMo',
    category: '通用对话',
    useCase: '高频调用、轻量问答、成本敏感场景',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: 'MiMo V2.6 的快速版，价格最低的一档，适合高频、轻量的调用。',
  },

  /* ---------------------------- 腾讯混元 ---------------------------- */
  {
    id: 'hy4-preview',
    displayName: 'Hunyuan Hy4 Preview',
    vendorName: '腾讯混元',
    category: '通用对话',
    useCase: '通用问答、内容生成、预览验证',
    capabilities: BASE_CAPS,
    contextWindow: '',
    maxOutput: '',
    description: '腾讯混元 Hy4 的预览版本，正式版发布前用于试用验证，行为与价格可能随版本变化。',
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
  hy4: 'Hy4',
  codex: 'Codex',
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
