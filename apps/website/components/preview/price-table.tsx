import Link from 'next/link';
import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList, modelPriceText } from '@/lib/pricing';
import { VendorLogo } from './vendor-logo';

/**
 * 实时价格（2026-11-13 第七版，只挂 /preview/home）
 *
 * 照 teamorouter 的做法：**一整张表，不是六张卡**。
 * 外圈一道细框，里面 3×2 六格，格与格之间用虚线分。
 *
 * 为什么这个形态比卡片好：
 * 六张独立卡片落在浅底上，每张都要自己撑出一圈留白，远看是六张贴纸；
 * 拼成一张表，边界只剩最外面那一圈，信息密度立刻上来，也更像「系统」。
 *
 * 三条没有让的底线（和正式版一致）：
 *   1. 不编折扣、不画划掉原价 —— 后台没有原价字段，画出来就是假价；
 *   2. 不编「省多少」—— 同理；
 *   3. 缺价就写「以控制台为准」，不写死数字。
 */
export async function PriceTableSection() {
  const { models } = await loadModelList(MODEL_CATALOG);
  const shown = models.slice(0, 6);

  /* 价格文案自带「/ 百万 tokens」，列头已经写了单位，再带一遍会换行 */
  const stripUnit = (text: string) => text.replace(/\s*\/\s*百万 tokens\s*$/, '');

  /*
   * 占位价的识别（照搬正式版 price-cards 的口径）：
   * 后台还有一批模型带着占位倍率，算出来是同一个数。
   * 如果某一档价格出现的次数占全体四成以上，就认为它还是占位值，
   * 这些格子一律写「以控制台为准」——摆一个 ¥547.50 出去等于报假价。
   */
  const counts = new Map<number, number>();
  models.forEach((model) => {
    if (model.price.mode === 'flat') {
      counts.set(model.price.inputPerM, (counts.get(model.price.inputPerM) ?? 0) + 1);
    }
  });
  let modalPrice: number | null = null;
  let modalCount = 0;
  counts.forEach((count, value) => {
    if (count > modalCount) {
      modalCount = count;
      modalPrice = value;
    }
  });
  const placeholderPrice =
    modalPrice !== null && modalCount >= Math.max(3, Math.ceil(models.length * 0.4))
      ? (modalPrice as number)
      : null;

  return (
    <section className="pv-sec bg-white">
      <div className="pv-wrap">
        <div className="text-center">
          <h2 className="pv-h2">模型价格，按量结算</h2>
          <p className="pv-sub mx-auto max-w-[40em]">
            单价按百万 tokens 计，后台改价这一块跟着变，不用重新发版。列表里没有的模型直接找我们开。
          </p>
        </div>

        <div className="pv-table mt-14">
          <div className="pv-table-grid">
            {shown.map((model) => {
              const isPlaceholder =
                model.price.mode === 'unknown' ||
                (model.price.mode === 'flat' &&
                  placeholderPrice !== null &&
                  Math.abs(model.price.inputPerM - placeholderPrice) < 0.01);
              const input = isPlaceholder ? '以控制台为准' : stripUnit(modelPriceText(model.price, 'input'));
              const output = isPlaceholder ? '' : stripUnit(modelPriceText(model.price, 'output'));

              return (
                <div key={model.id} className="pv-cell">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#eef3f9] bg-[#fbfdff]">
                      <VendorLogo vendor={model.vendorName} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-semibold tracking-tight text-[#06223f]">
                        {model.displayName}
                      </h3>
                      <p className="mt-1 truncate text-[11.5px] leading-none text-[#5c7189]">
                        {model.vendorName}
                        {model.contextWindow ? ` · 上下文 ${model.contextWindow}` : ''}
                      </p>
                    </div>

                    {model.category ? (
                      <span className="shrink-0 rounded-[4px] border border-[#e4ebf3] px-1.5 py-0.5 text-[10px] leading-[1.4] text-[#5c7189]">
                        {model.category}
                      </span>
                    ) : null}
                  </div>

                  {isPlaceholder ? (
                    <div className="mt-6 text-[13px] leading-[1.6] text-[#5c7189]">单价以控制台为准</div>
                  ) : (
                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-[#5c7189]">
                          输入 / 1M tokens
                        </div>
                        <div className="pv-price mt-2">{input}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-[#5c7189]">
                          输出 / 1M tokens
                        </div>
                        <div className="pv-price mt-2">{output}</div>
                      </div>
                    </div>
                  )}

                  <Link href="/docs/quickstart" className="pv-cell-action">
                    快速接入
                    <span aria-hidden className="pv-arrow">
                      →
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* 表尾巴：企业客户入口，跟表格共一条外框，收得干净 */}
          <Link
            href="/partner"
            className="flex items-center justify-between border-t border-[#e4ebf3] bg-[#f8fbfe] px-6 py-4 text-[13.5px] text-[#4a5f78] transition-colors hover:text-[#06223f]"
          >
            <span>企业客户？可以谈年度采购价与专属折扣</span>
            <span aria-hidden className="pv-arrow">
              →
            </span>
          </Link>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/pricing" className="pv-btn pv-btn--ghost pv-btn--sm">
            查看全部模型价格
            <span aria-hidden className="pv-arrow">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
