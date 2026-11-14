'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { modelPriceText, type ModelView } from '@/lib/pricing';
import { registerUrl } from '@/lib/brand';
import { VendorLogo } from '../vendor-logo';
import { Arrow } from '@/components/ui/arrow';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { STATIC_STATS } from './tokens';
import { ModelStack } from './model-stack';

/**
 * S5：模型与价格表（2026-11-13 晚加筛选与搜索；2026-11-14 加「最多 20 行」）。
 *
 * 为什么改成客户端组件：27 行平铺读起来像「配置文件截图」，而成熟站点的价格页
 * 一定让人能**筛**。加了三件事——按厂商筛、按分类筛、按名字搜——都是在同一份
 * 真数据上过滤，不改变「价格以后端为准」的口径（C-D-01 / C-D-04）。
 *
 * 2026-11-14 加显示上限（用户：「每次只最多显示 20 个，直接放 27 个不好，
 * 更多诱导去看价格和 AI 类型页」）：
 *   - 首页这一屏只铺前 20 行，模型再多也不把首页拉成一份长清单；
 *   - 出口全部收在表尾：图标堆叠胶囊 →/pricing（完整价格）、文字链 →/models（按类型挑）；
 *   - 表尾左边是**广告语**不是对账话术：用户连否两版（「这一屏只铺前 20 个」、
 *     「还有 7 个模型没列在表里」），要的是「广告语 + 更多内容请看哪」，
 *     定稿「更多模型与价格，看价格总览；按类型挑模型，去模型广场。」——
 *     前半句给理由（更多），后半句给去处（两个页面），具体按钮在右边。
 *
 * 后端不通时整表换成降级说明，不显示假数字。
 */
/**
 * 行数（2026-11-14 领导口径：这一屏还是太长 → 默认只显示 10 个，
 * 给一个展开/收起的开关：收起 10 行、展开 20 行，再多引到价格总览与模型广场）。
 */
/**
 * 数据条下面的五条卖点（领导口径：便宜 / 不跑路 / 稳定 / 不翻墙；用户：卖点要明显）。
 * 每条都写成**可核对的事实**，不写「绝不跑路」「低至 X 折」这类越强调越可疑的说法。
 */
const SELLING_POINTS = [
  '不用翻墙',
  '不囤额度',
  '无隐藏收费',
  '对公签约与发票',
  '调价提前公示',
] as const;

const COLLAPSED_ROWS = 10;
const EXPANDED_ROWS = 20;

export function PricingTable(props: { models: ModelView[]; pricingAvailable: boolean }) {
  const [vendor, setVendor] = useState<string>('全部');
  const [category, setCategory] = useState<string>('全部');
  const [keyword, setKeyword] = useState('');
  const [expanded, setExpanded] = useState(false);

  const vendors = useMemo(
    () => ['全部', ...Array.from(new Set(props.models.map((m) => m.vendorName)))],
    [props.models],
  );
  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(props.models.map((m) => m.category)))],
    [props.models],
  );

  const visible = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return props.models.filter((model) => {
      if (vendor !== '全部' && model.vendorName !== vendor) return false;
      if (category !== '全部' && model.category !== category) return false;
      if (kw && !`${model.displayName} ${model.id}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [props.models, vendor, category, keyword]);

  // 首页只铺 COLLAPSED_ROWS 行，点「展开」到 EXPANDED_ROWS 行；差额交给底部的两个出口
  const shown = visible.slice(0, expanded ? EXPANDED_ROWS : COLLAPSED_ROWS);
  const canExpand = visible.length > COLLAPSED_ROWS;

  // 广告栏用的「最低输入价」：从当前模型数据现算，不写死数字（接新模型会自动跟着变）
  const minInputPrice = useMemo(() => {
    const values = props.models
      .flatMap((model) => {
        const price = model.price;
        if (price.mode === 'flat') return [price.inputPerM];
        if (price.mode === 'tiered') return price.tiers.map((tier) => tier.inputPerM);
        return [];
      })
      .filter((value) => Number.isFinite(value) && value > 0);
    return values.length ? Math.min(...values) : null;
  }, [props.models]);

  if (!props.pricingAvailable) {
    return (
      <section className="border-b border-line bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
          <SectionHead
            eyebrow="模型与价格"
            title="价格暂时读不到"
            desc="后台计费接口当前不可达。为避免展示过期或编造的数字，这一屏先空着；价格以控制台结算为准。"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-line bg-white py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
        <SectionHead
          eyebrow="模型与价格"
          title={`${props.models.length} 个模型，一个 Key 全都能调`}
          desc="单价直接读后台计费配置生成，与下单结算一致；后台调价或上下架，这里跟着变。"
        />

        {/*
         * 价格数据带（2026-11-14 第三版，按 openrouter / stripe 的做法重做）。
         *
         * 看了 openrouter 首页与几篇 pricing 页规范，学到三件事：
         *   ① **数字不装在盒子里**：OpenRouter 的「800T+ / 10M+ / 600+」是纯文字排的，
         *      大号数字 + 小号标签，靠字号对比撑层次 —— 比「卡片 + 图标小方块」高级得多，
         *      这也是第二版显得堆砌的原因：装饰多、字号差小。
         *   ② **承诺写成一行 meta**（· 分隔），不逐条配图标：图标一多就成"卖点墙"。
         *   ③ **一条带上只留一个彩色**：这里是价格（brand-700），其余全墨色。
         * 所以这一版去掉浅底盒子、去掉图标方块，改成上下两条细线的「数据条」，
         * 承诺与按钮收在右下。数字仍然全部来自真实数据（模型数、最低价、协议数）。
         */}
        <div className="mt-8 border-y border-brand-200 bg-brand-50/60 px-5 py-6 lg:px-7 lg:py-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <dl className="flex flex-wrap items-end gap-x-10 gap-y-5">
              <div>
                <dd className="font-mono text-[38px] font-bold leading-none tracking-tight text-ink">
                  {props.models.length}
                </dd>
                <dt className="mt-2 text-meta text-ink-muted">个模型，一个 Key 全都能调</dt>
              </div>
              <div>
                <dd className="font-mono text-[38px] font-bold leading-none tracking-tight text-brand-700">
                  {minInputPrice === null ? '—' : `¥${minInputPrice.toFixed(2)}`}
                </dd>
                <dt className="mt-2 text-meta text-ink-muted">最低价 / 百万 tokens</dt>
              </div>
              <div>
                <dd className="font-mono text-[38px] font-bold leading-none tracking-tight text-ink">
                  {STATIC_STATS.protocols.value}
                </dd>
                <dt className="mt-2 text-meta text-ink-muted">种协议，共用一套地址</dt>
              </div>
            </dl>
            <Link
              href={registerUrl}
              className="group inline-flex h-11 shrink-0 items-center gap-1.5 rounded-none bg-ink px-5 text-note font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              免费注册拿 Key
              <Arrow />
            </Link>
          </div>

          {/*
           * 卖点行（2026-11-14 第三版后补：用户「卖点要明显啊」）。
           * 上一版把五条承诺压成一行 12px 灰字，等于藏起来了。现在：
           *   - 字号 12 → 14（text-note）、颜色 ink-mid → ink，字重 medium；
           *   - 每条前面加一枚品牌蓝勾（lucide Check，16px），勾比"·"更能读成"承诺"；
           *   - 单独一行铺在数据下面，用一条 hairline 与数据分开，跨度足够，不再挤在右下角。
           */}
          <ul className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2.5 border-t border-line pt-5">
            {SELLING_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5 text-note font-medium text-ink">
                <Check size={16} strokeWidth={2.6} aria-hidden className="shrink-0 text-brand-700" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------------- 筛选条 ---------------- */}
        <div className="mt-8 flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {vendors.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setVendor(item)}
                aria-pressed={vendor === item}
                className={[
                  'rounded-none px-2.5 py-1.5 text-meta transition-colors',
                  vendor === item
                    ? 'bg-ink text-white'
                    : 'text-ink-mid hover:bg-surface-subtle hover:text-ink',
                ].join(' ')}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="model-search">
              搜索模型
            </label>
            <input
              id="model-search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索模型名或 ID"
              className="h-9 w-[190px] rounded-none border border-line px-3 text-meta text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-ink/40"
            />

            <label className="sr-only" htmlFor="model-category">
              按分类筛选
            </label>
            <select
              id="model-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-9 rounded-none border border-line px-2.5 text-meta text-ink-mid outline-none transition-colors focus:border-ink/40"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === '全部' ? '全部分类' : item}
                </option>
              ))}
            </select>

            <span className="text-meta text-ink-muted">
              显示 {shown.length} / {props.models.length}
            </span>
          </div>
        </div>

        {/* ---------------- 表格 ---------------- */}
        {/* 桌面端：完整表格（≥ md 显示） */}
        <div className="hidden overflow-x-clip md:block">
          <table className="w-full min-w-[560px] border-collapse text-left">
            {/*
             * 表头（2026-11-14 修）：原来写的是 `sticky top-0`，滚到表格时表头会贴到
             * 视口最顶，正好被 65px 高的站点头盖住——只看得见下半截，用户反馈「头被截断」。
             * 站点头是 sticky top-0 且 z-50，所以表头必须停在它下面：top 改成 65px。
             * 同时给表头补一条底边：吸顶后行与行之间的分隔线会从表头下方滑过，没有这条线
             * 表头和第一行会粘成一片。
             */}
            <thead className="sticky top-[65px] z-10 border-b border-line bg-surface-subtle">
              <tr className="text-meta uppercase tracking-[0.08em] text-ink-muted">
                <th className="py-2.5 pr-4 font-medium">模型</th>
                <th className="hidden py-2.5 pr-4 font-medium sm:table-cell">厂商</th>
                <th className="hidden py-2.5 pr-4 font-medium md:table-cell">分类</th>
                <th className="py-2.5 pr-4 text-right font-medium">
                  输入<span className="hidden lg:inline"> / 百万 tokens</span>
                </th>
                <th className="py-2.5 pr-4 text-right font-medium">
                  输出<span className="hidden lg:inline"> / 百万 tokens</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((model) => (
                <tr
                  key={model.id}
                  className="border-t border-line transition-colors duration-150 hover:bg-brand-50/40"
                >
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/models/${encodeURIComponent(model.id)}`}
                      className="group flex items-start gap-3"
                    >
                      <VendorLogo vendor={model.vendorName} size={18} />
                      <span className="min-w-0">
                        <span className="block truncate text-note font-medium text-ink group-hover:text-brand-700">
                          {model.displayName}
                        </span>
                        <span className="block truncate font-mono text-meta text-ink-muted">
                          {model.id}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden py-2.5 pr-4 text-meta text-ink-mid sm:table-cell">
                    {model.vendorName}
                  </td>
                  <td className="hidden py-2.5 pr-4 text-meta text-ink-mid md:table-cell">
                    {model.category}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-right text-note text-ink">
                    <PriceCell text={modelPriceText(model.price, 'input')} />
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-right text-note text-ink">
                    <PriceCell text={modelPriceText(model.price, 'output')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="py-12 text-center text-note text-ink-muted">
              没有匹配的模型。清掉筛选条件，或到控制台的「模型」页看后台实际配置。
            </p>
          )}
        </div>

        {/* 手机端：表格换成列表。390 宽下三列表格必然横向滚动，换成每人一行的列表更好读 */}
        <ul className="border-y border-line md:hidden">
          {shown.map((model) => (
            <li
              key={model.id}
              className="border-b border-line last:border-b-0 transition-colors duration-150 hover:bg-brand-50/40"
            >
              <Link
                href={`/models/${encodeURIComponent(model.id)}`}
                className="flex items-center gap-3 py-3.5"
              >
                <VendorLogo vendor={model.vendorName} size={18} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-note font-medium text-ink">
                    {model.displayName}
                  </span>
                  <span className="block truncate font-mono text-meta text-ink-muted">
                    {model.id}
                  </span>
                </span>
                <span className="shrink-0 text-right text-meta text-ink-mid">
                  <span className="block">
                    入 {modelPriceText(model.price, 'input').split(' / ')[0]}
                  </span>
                  <span className="block">
                    出 {modelPriceText(model.price, 'output').split(' / ')[0]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="py-12 text-center text-note text-ink-muted">
              没有匹配的模型。清掉筛选条件，或到控制台的「模型」页看后台实际配置。
            </li>
          )}
        </ul>

        {/* 展开 / 收起（2026-11-14 领导：这一屏还是太长，默认 10 个 + 一个开关到 20 个）。
         *   - 只在筛完还有超过 10 条时才出现，否则这个按钮没有意义；
         *   - 文案只承诺"更多"，**不写"全部"**：展开是 20 条，而模型总数可能 27 条，
         *     写"全部"就是假话（用户当场指出）。收起态「展开更多」，展开态「收起」；
         *   - 表尾那句广告语与两个出口**保持不动**，开关只负责行数。 */}
        {canExpand && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="group inline-flex items-center gap-1.5 rounded-none border border-ink/20 px-4 py-2 text-meta font-medium text-ink transition-colors hover:border-ink/45 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              {expanded ? '收起' : '展开更多'}
              <ChevronDown
                size={14}
                strokeWidth={1.8}
                aria-hidden
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        )}

        {/* 底部收口（2026-11-14 第四版，按用户意见）：
         *   1. 整块居中——原来「左文案 / 右按钮」的左右分栏取消，一句话 + 一个胶囊居中收；
         *   2. 胶囊跳**模型广场**（/models），不是价格页：图标墙本来就是「看全部模型」的语义，
         *      label 跟着改成「查看全部模型」；价格入口降级成右侧文字链，两边不重复；
         *   3. 图标与 hover 散开动画**必须保留**（用户明确说别删），所以继续用 `ModelStack`。 */}
        <div className="mt-6 border-t border-line pt-6 text-center">
          <p className="mx-auto max-w-[42ch] text-note font-medium leading-relaxed text-ink">
            更多模型，请看模型广场；完整价格，请看价格总览。
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <ModelStack
              vendors={vendors.filter((item) => item !== '全部')}
              label="查看全部模型"
              href="/models"
            />
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-1.5 whitespace-nowrap text-meta font-medium text-ink transition-colors hover:text-brand-700"
            >
              完整价格表
              <Arrow />
            </Link>
          </div>

          <p className="mt-4 text-meta text-ink-muted">价格为当前配置，调价不回溯旧账。</p>
        </div>
      </div>
    </section>
  );
}

/**
 * 价格单元格：手机上只显示金额，单位「/ 百万 tokens」在窄屏隐藏。
 *
 * 为什么拆开：`¥15.00 / 百万 tokens` 整串在 390 宽的表里会撑出横向滚动条，
 * 而读者真正要比较的只是金额。单位在表头已经有说明，隐藏单位不丢信息。
 */
function PriceCell(props: { text: string }) {
  const [amount, ...rest] = props.text.split(' / ');
  const unit = rest.join(' / ');
  return (
    <>
      {amount}
      {unit && <span className="hidden lg:inline"> / {unit}</span>}
    </>
  );
}

function SectionHead(props: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:gap-12">
      <div>
        <SectionEyebrow>{props.eyebrow}</SectionEyebrow>
        <h2
          className="mt-4 text-balance font-bold tracking-tight text-ink"
          style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.15 }}
        >
          {props.title}
        </h2>
      </div>
      <p className="text-note leading-relaxed text-ink-mid md:pb-1.5">{props.desc}</p>
    </div>
  );
}


