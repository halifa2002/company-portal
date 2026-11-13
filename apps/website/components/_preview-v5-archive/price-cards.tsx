import Link from 'next/link';
import { modelPriceText, type ModelView } from '@/lib/pricing';
import { VendorLogo } from './vendor-logo';

/**
 * 模型价格卡（2026-11-13 第四版）
 *
 * 上一版照参考站做了「虚线格子表」：每格用 dashed 边框拼成一张大表。
 * 问题是虚线在白底上太轻，六格拼起來像一张还没画完的草图；
 * 而且每格里的「快速接入」也是一条虚线框，一屏里出现 12 条虚线，
 * 眼睛找不到一条能停下来的边。
 *
 * 现在改成「六张独立的块」：
 *   - 实线浅框 + 白底，落在浅蓝灰分区上，块与块之间靠底色分开，不用拼缝；
 *   - 单价用等宽字 22px（价格的数字必须比标签大三倍，不然看不出这是价格）；
 *   - 底部「快速接入」从虚线框改成一行箭头链接，视觉降一档，别和主按钮抢；
 *   - 类别（对话 / 推理）做成角上的小胶囊，把每张卡右上角填上，卡片不再"空一块"。
 *
 * 三条底线没让（跟上一版一致）：
 *   1. 折扣角标只在有真实原价/折扣字段时才出现，现在是空的——不编折扣；
 *   2. 划线原价同理，没有上游原价就不画假原价；
 *   3. 单价由后台倍率算，拿不到就写「以控制台为准」，不写死数字。
 */
export function PriceCards({ models }: { models: ReadonlyArray<ModelView> }) {
  /*
   * 价格文案自带「/ 百万 tokens」，列头已经写了单位，再带一遍又长又会换行；
   * 把单位削掉，只留数字，字号才撑得起来。
   */
  const stripUnit = (text: string) => text.replace(/\s*\/\s*百万 tokens\s*$/, '');
  /* 识别「默认价」：出现次数最多的那一档且占四成以上，就当它还没定价 */
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
      ? modalPrice
      : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {models.map((model) => {
        const isPlaceholder =
          model.price.mode === 'unknown' ||
          (model.price.mode === 'flat' &&
            placeholderPrice !== null &&
            Math.abs(model.price.inputPerM - placeholderPrice) < 0.01);

        const input = isPlaceholder ? '以控制台为准' : stripUnit(modelPriceText(model.price, 'input'));
        const output = isPlaceholder ? '以控制台为准' : stripUnit(modelPriceText(model.price, 'output'));

        return (
          <div
            key={model.id}
            className="pv-card pv-card--hover flex flex-col bg-white px-5 pb-4 pt-5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#eef2f7] bg-[#fbfdff]">
                <VendorLogo vendor={model.vendorName} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-body font-semibold tracking-tight text-ink">
                  {model.displayName}
                </h3>
                <p className="mt-0.5 truncate font-mono text-[11px] text-ink-muted">
                  {model.vendorName}
                  {model.contextWindow ? ` · ${model.contextWindow}` : ''}
                </p>
              </div>

              {/* 类别角标：把卡片右上角填上，不然每张卡都空一块 */}
              {model.category ? (
                <span className="shrink-0 rounded-[3px] border border-[#e3eaf2] px-1.5 py-0.5 text-[10px] leading-[1.4] tracking-wide text-ink-muted">
                  {model.category}
                </span>
              ) : null}
            </div>

            {/*
              价格区两档（2026-11-13 第五版）：
              有价的三张排成「输入 / 输出」两列、22px 大字；
              没定价的那张不再把「以控制台为准」在两个价格位各写一遍——
              三张并排时只有它一格空着，像漏填。
              现在它整行写一句，高度靠下面的 mt-auto 跟其他两张对齐。
            */}
            {isPlaceholder ? (
              <div className="mt-4 border-t border-[#eef2f7] pt-3.5 text-note leading-[1.6] text-ink-muted">
                {input}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#eef2f7] pt-3.5">
                <div>
                  <div className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">输入 / 百万 tokens</div>
                  <div className="pv-num mt-1 text-[22px] font-semibold leading-none text-ink">{input}</div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">输出 / 百万 tokens</div>
                  <div className="pv-num mt-1 text-[22px] font-semibold leading-none text-ink">{output}</div>
                </div>
              </div>
            )}

            <Link
              href="/docs/quickstart"
              className="group mt-auto flex items-center justify-between border-t border-[#eef2f7] pt-3 text-meta font-medium text-ink-mid transition-colors hover:text-brand"
            >
              快速接入
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
