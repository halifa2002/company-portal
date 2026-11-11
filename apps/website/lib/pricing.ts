/**
 * 官网的价格入口。
 *
 * 解析与换算的算法放在 @portal/pricing（控制台的模型卡片也用同一套），
 * 这里只保留「构建时从后端拉数据」的部分。
 *
 * 金额换算：
 *   quota 数量 ÷ quota_per_unit = 美元
 *   美元 × usd_exchange_rate = 人民币
 */

import {
  computePrice,
  formatCnyPerMillion,
  type Conversion,
  type ModelPrice,
  type PricingRow,
} from '@portal/pricing';
import { resolveCatalogEntry, type ModelCatalogEntry } from './model-catalog';

export * from '@portal/pricing';

/**
 * 单价文案：官网首页卡片和模型广场共用一套说法。
 *
 * 分时计价的模型取最低～最高区间；拿不到价格时绝不编数字，
 * 统一显示「以控制台为准」（文档 4.1：价格必须以后端计费规则为准）。
 */
export function modelPriceText(price: ModelPrice, kind: 'input' | 'output'): string {
  if (price.mode === 'unknown') return '以控制台为准';

  if (price.mode === 'flat') {
    const single = kind === 'input' ? price.inputPerM : price.outputPerM;
    return `${formatCnyPerMillion(single)} / 百万 tokens`;
  }

  const values = price.tiers
    .map((tier) => (kind === 'input' ? tier.inputPerM : tier.outputPerM))
    .filter((value) => value > 0);

  if (values.length === 0) return '以控制台为准';

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return `${formatCnyPerMillion(min)} / 百万 tokens`;
  return `${formatCnyPerMillion(min)}–${formatCnyPerMillion(max).replace('¥', '')} / 百万 tokens`;
}

export type ModelView = ModelCatalogEntry & {
  price: import('@portal/pricing').ModelPrice;
};

export type ModelListView = {
  models: ModelView[];
  /** 构建时拿不到后端价格时为 false，页面要提示而不是显示假数字 */
  pricingAvailable: boolean;
};

const API_BASE = process.env.PORTAL_API_BASE ?? 'http://localhost:4100';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`${path} 返回 ${response.status}`);
  }
  return (await response.json()) as T;
}

type PricingPayload = { data?: PricingRow[] };
type StatusPayload = {
  data?: { quota_per_unit?: number; usd_exchange_rate?: number };
};

/**
 * 构建时从后端拉价格。失败不抛错——返回 null 让页面提示「价格以下单时为准」，
 * 而不是让整站构建失败或显示编造的数字。
 */
export async function loadModelList(catalog: ModelCatalogEntry[]): Promise<ModelListView> {
  try {
    const [pricing, status] = await Promise.all([
      fetchJson<PricingPayload>('/api/pricing'),
      fetchJson<StatusPayload>('/api/status'),
    ]);

    const conv: Conversion = {
      quotaPerUsd: status.data?.quota_per_unit ?? 500_000,
      usdToCny: status.data?.usd_exchange_rate ?? 7.3,
    };

    const rowsByName = new Map((pricing.data ?? []).map((row) => [row.model_name, row]));

    // 以后端清单为准：后台接了新模型，官网下次构建就多一张卡，不用回来改代码。
    // 目录（MODEL_CATALOG）只负责补充介绍、分类、规格，认得的走目录，不认得的按名字兜底。
    const orderIndex = new Map(catalog.map((entry, index) => [entry.id, index]));

    const models = Array.from(rowsByName.values())
      .map((row) => ({ ...resolveCatalogEntry(row.model_name), price: computePrice(row, conv) }))
      .sort((left, right) => {
        const leftOrder = orderIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = orderIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return left.displayName.localeCompare(right.displayName);
      });

    if (models.length === 0) {
      console.warn('[models] 后端没有返回任何模型，页面将显示空状态');
    }

    return { models, pricingAvailable: true };
  } catch (error) {
    console.warn('[models] 拉取后端价格失败，本次构建不显示具体价格：', error);
    return {
      models: catalog.map((entry) => ({ ...entry, price: { mode: 'unknown' as const } })),
      pricingAvailable: false,
    };
  }
}
