import Link from 'next/link';
import { registerUrl, consoleUrl } from '@/lib/brand';
import { buttonStyles } from '@/components/ui/button';

/**
 * 转化带（2026-11-14 第十版：一条更紧凑、有蓝有暖的横幅）。
 *
 * 前九版的两难：深蓝发沉（像抑郁），浅色发白（像没做）。这一版换成**中间调**：
 * 用生图出的水彩天空（上蓝、左下杏橘）当底，压一层 0.32 的深色保证白字可读，
 * 高度从 ~380px 收到 ~200px、标题从 46px 收到 34px——用户要求「紧凑，不要太大太高」。
 *
 * 合规：底色里的杏橘是**图片本身的光**，没有进入 UI 色板；文字、按钮、图标仍只有
 * 深海军蓝 + 品牌蓝两种（C-V-03 单一强调色）。标题里「用多少扣多少」用 brand-300 提亮。
 */

const STEPS = ['注册并拿到 Key', '换地址与密钥', '沿用原代码调用'];

export function QuickStart() {
  return (
    <section
      className="relative overflow-hidden border-y border-line text-white"
      style={{
        backgroundImage: [
          'linear-gradient(90deg, rgba(8,48,86,0.42) 0%, rgba(8,48,86,0.24) 55%, rgba(8,48,86,0.12) 100%)',
          "url('/hero/band-canvas-4.webp')",
        ].join(', '),
        backgroundSize: 'cover, cover, cover',
        backgroundPosition: 'center, center, center 45%',
      }}
    >
      {/* 左侧文字区单独压一层暗角：图是水彩天空，局部偏亮时亮蓝高亮词会糊在底上
       * （用户反馈「用多少扣多少」看不清）。这层只在文字所在区域生效，右边继续透图。 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[62%]"
        style={{
          background:
            'linear-gradient(90deg, rgba(3,18,34,0.62) 0%, rgba(3,18,34,0.40) 55%, rgba(3,18,34,0) 100%)',
        }}
      />
      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-9 md:px-10 md:py-11">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          {/* 左：标题 + 一句说明 */}
          <div className="max-w-[34em]">
            <h2 className="text-balance font-bold tracking-tight text-white" style={{ fontSize: 'clamp(22px, 2.3vw, 32px)', lineHeight: 1.2 }}>
              按 token 计费，<span className="text-brand-200">用多少扣多少</span>
            </h2>
            <p className="mt-2 text-meta leading-relaxed text-white">
              输入、输出与缓存命中分别计价；余额不足直接拒绝，不产生欠费。人民币计价，无最低消费。
            </p>
          </div>

          {/* 右：按钮 + 三步小字（2026-11-14 按参考站改：主按钮＝购买额度，带箭头方块；次按钮＝快速接入） */}
          <div className="shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${consoleUrl}/wallet`}
                className="group inline-flex h-11 items-stretch rounded-none bg-ink text-white transition-colors hover:bg-ink/90"
              >
                <span
                  aria-hidden
                  className="flex w-10 items-center justify-center bg-white text-ink transition-transform duration-150 group-hover:translate-x-0.5"
                >
                  →
                </span>
                <span className="flex items-center px-5 text-note font-medium">购买额度</span>
              </Link>
              <Link
                href="/docs/quickstart"
                className="inline-flex h-11 items-center gap-1.5 rounded-none border border-white/45 px-5 text-note font-medium text-white transition-colors hover:border-white/80 hover:bg-white/10"
              >
                快速接入
              </Link>
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] text-white/80">
              {STEPS.map((step, index) => (
                <span key={step} className="flex items-center gap-1.5">
                  <span>{step}</span>
                  {index < STEPS.length - 1 && <span aria-hidden className="text-white/30">→</span>}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
