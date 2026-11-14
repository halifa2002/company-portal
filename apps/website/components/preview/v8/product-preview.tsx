import Link from 'next/link';
import { consoleUrl } from '@/lib/brand';
import { Arrow } from '@/components/ui/arrow';
import { buttonStyles } from '@/components/ui/button';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

/**
 * 产品界面预览。
 *
 * 为什么加这一块（2026-11-14）：首页一直"看着空"，根因不是屏数少，而是**没有产品实体的痕迹**——
 * 全是文字描述，读者看不到"这东西长什么样"。中型公司的首页一定会给一块产品界面。
 *
 * 诚实性处理：我们拿不出真实账号的截图，所以这里用设计稿拼一块控制台界面，
 * **并且明确标注「界面示意 · 数据为示例」**，不让读者误认为是真实运行数据
 * （文档 4.2 A 明令禁止用模拟数据冒充正式统计）。真实数据在控制台里，链接指过去。
 */

const TILES = [
  { label: '账户余额', value: '¥ 1,284.50' },
  { label: '今日消费', value: '¥ 12.40' },
  { label: '本月调用', value: '18,642' },
  { label: '活跃密钥', value: '3' },
];

const BARS = [42, 68, 51, 83, 60, 74, 38];

const CALLS = [
  { model: 'glm-5.3', tokens: '2,140', cost: '¥0.0132', ok: true },
  { model: 'kimi-k3', tokens: '8,905', cost: '¥0.0584', ok: true },
  { model: 'gpt-6-luna', tokens: '1,032', cost: '¥0.0215', ok: false },
];

const POINTS = [
  '余额、今日与本月消费一屏看到',
  '每个密钥单独设额度与可用模型',
  '每次调用都能追到模型、token 与金额',
];

export function ProductPreview() {
  return (
    <section className="border-b border-line py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
          {/* 左：说明 */}
          <div>
            <SectionEyebrow>控制台</SectionEyebrow>
            <h2
              className="mt-4 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(32px, 3vw, 52px)', lineHeight: 1.15 }}
            >
              密钥、用量与账单，统一在控制台管理
            </h2>
            <p className="mt-4 text-note leading-relaxed text-ink-mid">
              创建密钥、查看用量、核对账单都在同一处完成，不需要额外工具，也不需要向平台索取数据。
            </p>

            <ul className="mt-6 space-y-2.5">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-note text-ink-mid">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  {point}
                </li>
              ))}
            </ul>

            <Link href={consoleUrl} className={`group mt-7 ${buttonStyles('primary')}`}>
              打开控制台
              <Arrow />
            </Link>
          </div>

          {/* 右：界面示意 */}
          <div className="group relative rounded-none border border-line bg-white p-4 shadow-[0_18px_50px_-40px_rgba(6,34,63,0.5)] transition-all duration-300 hover:shadow-[0_24px_60px_-40px_rgba(6,34,63,0.6)]">
            {/* 装饰渐变边框 */}
            <div className="pointer-events-none absolute inset-0 rounded-none bg-gradient-to-br from-brand-200/20 via-transparent to-brand-300/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* 窗口条 */}
            <div className="relative flex items-center gap-2 border-b border-line pb-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-300/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-300/60" />
                <span className="h-3 w-3 rounded-full bg-green-300/60" />
              </div>
              <span className="ml-2 font-mono text-meta text-ink-muted">console · 概览</span>
              <span className="ml-auto rounded-none border border-line bg-surface-subtle px-2.5 py-0.5 text-meta font-medium text-ink-mid">
                界面示意 · 数据为示例
              </span>
            </div>

            {/* 数字卡 */}
            <div className="relative mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {TILES.map((tile, index) => (
                <div
                  key={tile.label}
                  className="group/card relative overflow-hidden rounded-none border border-line bg-white px-3 py-3 transition-all duration-200 hover:border-brand-300 hover:shadow-md"
                >
                  {/* 装饰角标 */}
                  <div className="absolute top-0 right-0 h-8 w-8 bg-neutral-100/70" />
                  <div className="relative">
                    <div className="text-meta font-medium text-ink-muted">{tile.label}</div>
                    <div className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-ink">
                      {tile.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 趋势 */}
            <div className="relative mt-4 overflow-hidden rounded-none border border-line bg-white px-4 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-meta font-medium text-ink-muted">近 7 天调用</span>
                <span className="rounded-none bg-neutral-100 px-2 py-0.5 text-meta font-medium text-ink-mid">示例</span>
              </div>
              <div className="mt-3 flex h-24 items-end gap-2">
                {BARS.map((height, index) => (
                  <div
                    key={index}
                    className="group/bar relative flex-1"
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className="h-full w-full rounded-t-[2px] bg-brand-700 transition-colors duration-200 group-hover/bar:bg-brand-900"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 最近调用 */}
            <div className="mt-4">
              <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.5fr] gap-2 border-b border-line pb-2 text-meta text-ink-muted">
                <span>模型</span>
                <span className="text-right">Tokens</span>
                <span className="text-right">金额</span>
                <span className="text-right">状态</span>
              </div>
              {CALLS.map((call) => (
                <div
                  key={call.model}
                  className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.5fr] items-center gap-2 border-b border-line/60 py-2 text-meta last:border-b-0"
                >
                  <span className="truncate font-mono text-ink">{call.model}</span>
                  <span className="text-right font-mono tabular-nums text-ink-mid">
                    {call.tokens}
                  </span>
                  <span className="text-right font-mono tabular-nums text-ink-mid">{call.cost}</span>
                  <span className="text-right">
                    <span
                      className={
                        call.ok
                          ? 'rounded bg-ok-soft px-1.5 py-0.5 text-ok-text'
                          : 'rounded bg-danger-soft px-1.5 py-0.5 text-danger-text'
                      }
                    >
                      {call.ok ? '成功' : '失败'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

