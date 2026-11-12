import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CodePreview } from '@/components/code-preview';
import { FaqAccordion, type FaqItem } from '@/components/faq-accordion';
import { registerUrl } from '@/lib/brand';

/** 首屏颗粒底纹：180×180 的 SVG 噪点，平铺后压在大面积渐变上，消掉色带 */
const grainTexture =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>\")";

/**
 * 首屏底部的模型厂牌。
 *
 * 与 /models 的实际清单对齐：后台接了新厂牌，这里要跟着加一行。
 * 只写厂牌不写型号，更不写价格——价格以价格页为准（文档 4.1）。
 */
const gatewayVendors = ['DeepSeek', 'GLM', 'Kimi', 'Qwen', 'MiniMax'] as const;


/**
 * 品牌官网首页 —— 对应 md 4.1「首页」九项要求：
 * ① 顶部品牌导航 ② 产品介绍 ③ 平台能力介绍 ④ 模型与定价入口
 * ⑤ 服务优势 ⑥ API 接入示例 ⑦ 定价入口 ⑧ 开发者入口 ⑨ 注册登录入口
 *
 * 视觉取向（2026-11-12 改版）：首屏保留整屏流动光带，下面是「浅底 + 大圆角白卡」。
 * 版式参考 agtcloud：区块标题居中、能力用一张细线分格的整卡承载，
 * 不再是一段段左对齐的文字堆——那是文档的排法，不是产品官网的排法。
 */

/* ============================ 内容 ============================ */

/**
 * 首屏下面这两张卡：一张给要动手的人，一张给要评估的人。
 *
 * 右卡原来讲「企业服务 · 额度权限账单」并跳转计费页，但计费已经有独立页面
 * （导航「价格」+ 定价页 + 页尾指路区都在指它），再从这儿指一次是第三条重复的路。
 * 所以右卡改成「关于」，讲平台定位——这是全站唯一还没被首页导流过的正经页面。
 */
const accessModes = [
  {
    eyebrow: '开发者平台',
    title: '用一个 API 调用多种模型',
    desc: '兼容三种主流协议，换模型只改 model 字段。',
    href: '/docs',
    linkLabel: '查看接入文档',
    icon: <PlugIcon />,
  },
  {
    eyebrow: '关于我们',
    title: '这个平台在做的事',
    desc: '不自研模型，只把接入、计费与用量收进网关。',
    href: '/about',
    linkLabel: '了解平台',
    icon: <CompanyIcon />,
  },
] as const;

/**
 * 模型与定价：首页只给两张入口卡，不铺具体模型名和单价。
 *
 * 之前在首页直接列模型卡，问题有两个：价格表里还有一批占位倍率，
 * 摆上去等于报了假价；上架的模型数还会随时变，四列铺不满就空半排。
 * 明细统一放模型广场和定价页，首页只负责把人送过去。
 */
const modelPricingLinks = [
  {
    eyebrow: '立即体验',
    title: '探索可用模型',
    desc: '查看模型能力、上下文长度与调用方式，按场景挑一个。',
    href: '/models',
    linkLabel: '浏览模型',
    icon: <RocketIcon />,
  },
  {
    eyebrow: '计费透明',
    title: '查看实时定价',
    desc: '输入输出单价、计费规则与额度说明，一页看全。',
    href: '/pricing',
    linkLabel: '查看定价',
    icon: <PriceTagIcon />,
  },
] as const;

/**
 * 页尾问答：只放「第一次来的人会卡住」的那几条。
 *
 * 内容全部来自 /docs/faq 里已经核实过的说法，不是这里另写一套口径——
 * 首页和文档页对同一个问题给两种答案，比没有答案更糟。
 * 更细的规则（分时段计价、额度用完与余额不足的区别）留在文档里，首页不铺开。
 */
const faqItems: ReadonlyArray<FaqItem> = [
  {
    q: '第一次调用要从哪开始？',
    a: '登录控制台，在「API 密钥」页新建一把 Key；再把代码里的 base_url 指向本平台、api_key 换成平台密钥，其余参数不用动。照着快速开始走一遍大约十分钟。',
  },
  {
    q: '平台怎么计费？',
    a: '按 token 计费，输入和输出分开计价，部分模型分时段。费用按调用发生时的价格结算，调价不会回头改旧账。单价以价格页为准。',
  },
  {
    q: 'API Key 怎么保证安全？',
    a: '完整的 Key 只在创建时显示一次，之后只保留前缀；服务端加密保存，不再回传明文。建议按项目或环境分开建 Key，某一把泄露只删那一把，不影响其他业务。',
  },
  {
    q: '已经有 OpenAI 的代码，要改多少？',
    a: '只改两处：base_url 和 api_key。SDK、请求参数、调用方式都不用改。',
  },
  {
    q: '调用报错了先看哪里？',
    a: '401 是 Key 有问题，403 是余额不足，429 是被限流，503 是模型不可用。逐个状态码对照错误码页，能直接定位到原因。',
  },
];

/**
 * 平台能力：一段一张卡反而散，收进一张细线分格的整卡里，
 * 六个点读起来才是「一个平台」而不是「六件无关的事」。
 * 图标各自不同——六条共用一个勾，读者扫一眼就滑过去了。
 */
const capabilities: ReadonlyArray<{ title: string; desc: string; icon: ReactNode }> = [
  {
    title: '主流模型覆盖',
    desc: '通用对话、推理、编程等主流模型统一接入，厂商上新同步跟进。',
    icon: (
      <>
        <path d="M12 3.6 3.8 7.8 12 12l8.2-4.2z" strokeLinejoin="round" />
        <path d="M3.8 12 12 16.2 20.2 12M3.8 16.2 12 20.4l8.2-4.2" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: '统一接口',
    desc: '三种协议共用一套鉴权与请求格式，不用为每个厂商写一套适配。',
    icon: (
      <>
        <path d="M12 3.4 20 7.6v8.8L12 20.6l-8-4.2V7.6z" strokeLinejoin="round" />
        <path d="M12 12 20 7.6M12 12v8.6M12 12 4 7.6" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: '稳定调用',
    desc: '同一模型可配多条上游线路，单条异常时自动重试并切换。',
    icon: (
      <>
        <path d="M4.2 17.4a8 8 0 1 1 15.6 0" strokeLinecap="round" />
        <path d="M12 17.4 15.6 11.6" strokeLinecap="round" />
        <circle cx="12" cy="17.4" r="1.3" />
      </>
    ),
  },
  {
    title: '成本透明',
    desc: '价格、用量、账单在同一处查看，每一笔扣费都能追到具体请求。',
    icon: (
      <>
        <path d="M6 3.6h12v17l-3-2-3 2-3-2-3 2z" strokeLinejoin="round" />
        <path d="M9 8.4h6M9 12.4h4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: '额度可控',
    desc: '每个 Key 独立设额度上限与模型权限，单个应用吃不光整月预算。',
    icon: (
      <>
        <path d="M12 3.2 19 6v5.2c0 4.2-2.9 6.9-7 8.4-4.1-1.5-7-4.2-7-8.4V6z" strokeLinejoin="round" />
        <path d="M9.4 13.4V11m2.6 2.4V9.4m2.6 4V12" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: '接入零改造',
    desc: '换掉 base_url 与密钥即可上线，文档、示例与常见客户端都已就绪。',
    icon: (
      <>
        <path d="M9 8 5 12l4 4M15 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

const steps = [
  { no: '01', title: '注册并获取 Key', desc: '登录控制台，在「API 密钥」页新建一个 Key。' },
  { no: '02', title: '替换地址与密钥', desc: '把 base_url 指向本平台，API Key 换成平台密钥。' },
  { no: '03', title: '直接调用', desc: '沿用原有 SDK 与代码，不需要改调用逻辑。' },
];

/* ============================ 小零件 ============================ */

/**
 * 区块标题：小字标签 + 大标题 + 一句说明，整体居中。
 *
 * 之前每个区块是左上角一个大标题、下面一段长文，看起来像产品文档的章节。
 * 改成居中的三段式后，视线先落到一句话上，再往下看内容。
 */
function SectionHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="text-center">
      {/*
        用 flex 包一层再居中，不要给标签本身写 inline-block + text-align: center：
        这种情况下浏览器会把标签宽度算成「最窄能多窄」，中文逐字换行会把标签压成一根竖柱。
      */}
      <div className="flex justify-center">
        <span className="whitespace-nowrap text-meta font-semibold text-brand">{eyebrow}</span>
      </div>
      <h2
        className="mt-3.5 text-balance font-bold tracking-tight text-ink"
        /*
          容器从 976 放宽到 1392 之后，36px 的区块标题在宽版式里明显偏小，
          像一行正文放大了一点而已。跟着视口缩放，宽屏才撑得住版面。
        */
        style={{ fontSize: 'clamp(30px, 2.9vw, 46px)', lineHeight: 1.15 }}
      >
        {title}
      </h2>
      {desc ? (
        <p className="mx-auto mt-5 max-w-2xl text-balance text-title leading-relaxed text-ink-mid">
          {desc}
        </p>
      ) : null}
    </div>
  );
}

/* ============================ 页面 ============================ */

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/*
          首屏：小屏铺满视口，大屏封顶 880px。
          不封顶的话，27 寸以上屏幕会是 1100+px 高，内容只占中间一小块，
          四周全是空白，看起来"区块很大但很空"。
        */}
        <section className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden 2xl:min-h-[880px]">
          {/*
            背景（2026-11-12 换掉丝带图）：
            原来是 hero-bg.jpg 一张图铺满首屏，问题是它把「网关」讲成了一团蓝色——
            装饰盖过产品，而且缩放、手机上裁切都不可控。
            现在改成纯 CSS 三层：底部一层靛蓝光晕 + 点阵 + 极淡颗粒。
            光晕只从底边化开，不占视觉中心，标题区和它不打架。
          */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {/*
              光晕停在底栏上方 112px：底栏那几个厂牌要落在白底上，
              光晕如果一直铺到区块边界，翻页时就是一条紫色的硬切线。
            */}
            <div
              className="absolute inset-x-0 bottom-[112px] h-[620px]"
              style={{
                background:
                  'radial-gradient(56% 96% at 50% 100%, rgba(79,70,229,0.50) 0%, rgba(99,102,241,0.24) 42%, rgba(199,210,254,0) 76%), radial-gradient(44% 62% at 81% 100%, rgba(56,189,248,0.14) 0%, rgba(56,189,248,0) 68%)',
              }}
            />
            {/* 点阵：给光晕一点「屏幕质感」，越往下越密，往上淡出 */}
            <div
              className="absolute inset-x-0 bottom-[112px] h-[420px] opacity-60"
              style={{
                backgroundImage: 'radial-gradient(rgba(30,38,70,0.13) 1px, transparent 1px)',
                backgroundSize: '7px 7px',
                maskImage: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.55) 38%, transparent 88%)',
                WebkitMaskImage:
                  'linear-gradient(to top, #000 0%, rgba(0,0,0,0.55) 38%, transparent 88%)',
              }}
            />
            {/* 光晕下沿化到白：不留一条色带 */}
            <div
              className="absolute inset-x-0 bottom-[112px] h-[150px]"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 100%)',
              }}
            />
            {/* 颗粒：整屏一层噪点，压住大面积渐变的「色带」感 */}
            <div
              className="absolute inset-0 opacity-[0.045] mix-blend-multiply"
              style={{ backgroundImage: grainTexture }}
            />
          </div>

          {/* 中央文案 */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-20 text-center md:pt-24">
            <div className="flex items-center gap-2.5 text-meta font-medium uppercase tracking-[0.19em] text-ink-muted">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Unified API Gateway · 统一网关
            </div>

            {/*
              大标题（2026-11-12 二次调整）：去掉衬线，换无衬线，字重也降下来。
              衬线在中文大字号下偏「杂志标题」，读起来不像技术产品；
              700 黑体又太厚——64px 下笔画之间的空隙被填满，看着笨。
              现在 400 + 收一点字距：单看轻，但字号撑得住，气质是「安静的贵」。
              注意 400 已经是下限，再细（300）在 1080p 上中文竖笔会发虚。
            */}
            <h1
              className="mt-7 font-display font-normal leading-[1.2] tracking-[-0.012em] text-ink"
              style={{ fontSize: 'clamp(34px, 4.7vw, 64px)' }}
            >
              一个 Key，<br className="sm:hidden" />调用所有主流模型
            </h1>

            {/*
              副标题只说两件能验证的事：兼容 OpenAI 接口、要改的只有两行。
              以前这里写「三种协议」，但文档里另外三种要等上游通道支持才能用，
              首页不能比文档先许诺。
            */}
            <p
              className="mx-auto mt-6 max-w-[680px] text-balance leading-relaxed text-ink-mid"
              style={{ fontSize: 'clamp(16px, 1.15vw, 18px)' }}
            >
              兼容 OpenAI 接口。把 base_url 和 api_key 换成平台地址与密钥，其余代码不用动。
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
              {/*
                主按钮用近黑而不是品牌渐变：衬线标题下面接一条彩色渐变按钮，
                两种「重」互相抢。靛蓝留给光晕、logo 和登录按钮，主按钮退成黑白更稳。
              */}
              <Link
                href={registerUrl}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#12141f] px-7 py-3.5 text-title font-medium text-white shadow-[0_10px_24px_rgba(10,15,30,0.18)] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                开始使用
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-title font-medium text-ink transition-colors hover:text-brand"
              >
                查看文档
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/*
            底部一行模型厂牌：原先是「常见应用支持」四个胶囊（Cherry Studio / CC Switch /
            NextChat / 更多），其中「更多」是个点不动的占位，摆出来等于告诉访客没做完。
            换成模型厂牌——它回答的是「这里能调到谁」，比客户端列表更像这个平台该说的话。
            名单与 /models 的实际清单对齐，价格仍然一个都不写。
          */}
          <div className="relative z-10 pb-14 text-center">
            <div className="text-meta uppercase tracking-[0.16em] text-ink-muted">已上架模型</div>
            {/*
              窄屏不能带竖分隔线：五个厂牌排不满一行会折成两行，
              折行处第一项顶着一条竖线，看起来像漏了个字。分隔线只在 sm 以上出现。
            */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-y-2 text-note text-ink-mid sm:text-body">
              {gatewayVendors.map((vendor, index) => (
                <span
                  key={vendor}
                  className={
                    index === 0
                      ? 'px-2.5 sm:px-4'
                      : 'border-line px-2.5 sm:border-l sm:px-4'
                  }
                >
                  {vendor}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 产品介绍：接入 / 关于 两个入口 ============ */}
        <section className="border-b border-line bg-white py-20 md:py-24">
          <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
            <SectionHead
              eyebrow="平台概览"
              title="先了解平台，再开始接入"
              desc="要动手的直接看文档，要评估的先看平台在做什么。"
            />

            <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-2">
              {accessModes.map((mode) => (
                <Link
                  key={mode.eyebrow}
                  href={mode.href}
                  /*
                    原来的底色是从左上白到右下淡紫的斜向渐变，配一圈 brand/12 的紫边。
                    问题不在「有颜色」，在于它同时做了三件事：一张卡里既渐变、又描色边、
                    又给图标加靛蓝外发光——三样都是装饰，读的人反而看不见内容。
                    现在退回「白底 + 一档发丝线」，颜色只留给图标块和小字标签。
                  */
                  className="group flex gap-7 rounded-wide border border-line bg-white p-9 transition-colors duration-300 hover:border-brand/30 hover:shadow-[var(--shadow-card)] md:gap-8 md:p-10"
                >
                  {/*
                    原来是「图标在上、文字在下」的竖排，卡片一放宽到 684px，
                    内容只占左边三分之二，右边空出一大块，反而更空。
                    改成图标在左、文字在右：文字列自己撑满横向，右边不再留洞。
                  */}
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-brand-soft text-brand md:h-16 md:w-16">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {mode.icon}
                    </svg>
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="text-meta font-semibold uppercase tracking-[0.1em] text-brand">
                      {mode.eyebrow}
                    </div>
                    <h3 className="mt-3 text-heading font-bold tracking-tight text-ink md:text-display">
                      {mode.title}
                    </h3>
                    <p className="mt-3.5 text-body leading-relaxed text-ink-mid">{mode.desc}</p>

                    {/* 分隔线要跟描述拉开距离，否则像给描述画了条下划线 */}
                    <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                      <span className="text-body font-medium text-brand">{mode.linkLabel}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/[0.08] text-brand transition-transform duration-300 group-hover:translate-x-1">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 平台能力：一张细线分格的整卡 ============ */}
        <section className="border-b border-line bg-surface-subtle py-20 md:py-24">
          <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
            <SectionHead
              eyebrow="平台能力"
              title="让模型接入更简单、更可靠"
              desc="接入、计费、额度、监控，都在一个平台里完成。"
            />

            {/*
              分格靠 gap-px + 容器底色draw出来，而不是给每个格子写一堆 border-*
              的响应式分支：换列数时分割线自动重排，不会出现某条线在某个断点消失。
            */}
            <div className="mt-14 grid gap-px overflow-hidden rounded-wide border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item) => (
                <div
                  key={item.title}
                  className="group bg-white p-8 transition-colors duration-300 hover:bg-surface-tint-soft md:p-10"
                >
                  {/*
                    三个字一排横着放，下面两行小字，格子会很"薄"——原来 120px 高就是这么来的。
                    图标提到标题上方、加一块浅色底，格子立刻有了上下结构，也撑到了 200px 以上。
                  */}
                  <span className="flex h-11 w-11 items-center justify-center rounded-card bg-brand/[0.07] text-brand ring-1 ring-inset ring-brand/10">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden
                    >
                      {item.icon}
                    </svg>
                  </span>
                  <h3 className="mt-6 whitespace-nowrap text-title font-semibold text-ink">
                    {item.title}
                  </h3>
                  {/*
                    中文断行要 text-balance 而不是 text-pretty：
                    pretty 只处理「英文单词不被拆」，中文照样会在末行留一个「进。」。
                    balance 会把两行长度拉匀，末行不会只剩一两个字。
                  */}
                  <p className="mt-3 text-balance text-body leading-relaxed text-ink-mid">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 模型与定价：两张入口卡，不暴露具体模型与单价 ============ */}
        <section className="border-b border-line bg-white py-20 md:py-24">
          <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
            <SectionHead
              eyebrow="模型与定价"
              title="覆盖主流模型，价格实时公开"
              desc="完整清单与实时单价集中在模型广场和定价页，随平台配置同步更新。"
            />

            {/*
              这一组原来是「两张和上面一模一样的卡，只是换了一套渐变」。
              两组版式本来就相同，当初靠两套不同的渐变把它们分开——那是在用装饰
              解决结构问题，而斜向渐变和彩色外发光正是最显旧的两样。

              现在改结构：上面那组是并列大卡（主入口），这一组是一张整体容器、
              用发丝线分成两格（次入口）。翻开就知道层级不同，不需要靠配色暗示。
              版式取自 SiliconFlow「为什么选择」那一段的分格做法。
            */}
            <div className="mt-14 overflow-hidden rounded-wide border border-line bg-white md:mt-16">
              <div className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
                {modelPricingLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center gap-5 p-8 transition-colors duration-300 hover:bg-surface-subtle md:gap-6 md:p-10"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-brand-soft text-brand">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        {item.icon}
                      </svg>
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-meta font-semibold tracking-[0.1em] text-brand">
                        {item.eyebrow}
                      </div>
                      <h3 className="mt-2 text-title font-semibold text-ink">{item.title}</h3>
                      <p className="mt-2 text-body leading-relaxed text-ink-mid">{item.desc}</p>
                    </div>

                    {/* 箭头不做成实心圆：这一组是次入口，实心圆会和上面的主卡抢注意力 */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ API 接入示例（md 明确要求）============ */}
        <section
          id="api-example"
          className="scroll-mt-20 border-b border-line bg-surface-subtle py-20 md:py-24"
        >
          <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
            <SectionHead
              eyebrow="API 接入示例"
              title="四种协议，一套调用方式"
              desc="复制下面的示例，把地址和密钥换成你自己的就能跑"
            />
            {/*
              代码块原来是 max-w-4xl（896），在 1392 的宽版式里上下区块都铺满了、
              它却在中间窄一截，像被夹住。放到 6xl（1152）：够宽，但单行代码仍不会拉成长条。
            */}
            <div className="mx-auto mt-12 max-w-6xl">
              <CodePreview />
            </div>
          </div>
        </section>

        {/* ============ 服务优势 / 接入三步 ============ */}
        <section className="border-b border-line bg-white py-20 md:py-24">
          <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
            <SectionHead
              eyebrow="接入流程"
              title="三步接入，不用重写代码"
              desc="已经有现成代码的，通常只改两行配置就能跑通。"
            />

            <div className="mt-14 grid gap-px overflow-hidden rounded-wide border border-line bg-line md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.no}
                  className="group bg-white p-9 transition-colors duration-300 hover:bg-surface-tint-soft md:p-11"
                >
                  {/*
                    编号原来是 12px 的等宽小字，和 28px 的标题并排显得可有可无。
                    放大到接近标题一档、压成很淡的品牌色，它就成了这一步的"页码"，
                    三步之间有了顺序感，而不只是三块并排的说明。
                  */}
                  <span className="font-mono text-display font-bold leading-none text-brand/25 transition-colors duration-300 group-hover:text-brand/60">
                    {step.no}
                  </span>
                  <h3 className="mt-4 text-display font-bold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-balance text-body leading-relaxed text-ink-mid">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-body text-ink-mid">
              <span>不确定从哪儿开始？照着接入文档走一遍大约十分钟。</span>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1.5 font-medium text-brand transition-colors hover:text-brand-hover"
              >
                打开接入文档
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ============ 页尾：常见问题（左标题，右折叠问答） ============ */}
        {/*
          这里原来是一块推销区：大标语「按实际用量付费，没有最低消费」加两个大按钮。
          问题不在于页尾要有注册入口，而在于它跟上面「三步接入」讲的是同一件事，
          却换成更大的字和更重的按钮又喊一遍。访客读到页尾时心里多半已经定了，
          再喊一遍只会显得急。

          改成问答：走到页尾的人通常是「想动手但还剩一两个顾虑」，正面回答比继续
          说服有用。版式参照 agtcloud 首页的 FAQ 区——左栏一个标题加一句说明，
          右栏一组可展开的问题。
        */}
        <section className="bg-surface-subtle py-20 md:py-24">
          <div className="mx-auto w-full max-w-[1600px] px-6 2xl:px-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-20">
              {/*
                左栏 sticky：右边展开某一条时，标题和「查看全部问题」还留在视口里，
                不会因为答被拉开而整块滚上去。
              */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="flex">
                  <span className="whitespace-nowrap text-meta font-semibold tracking-[0.1em] text-brand">
                    帮助
                  </span>
                </div>
                <h2
                  className="mt-3.5 text-balance font-bold tracking-tight text-ink"
                  style={{ fontSize: 'clamp(28px, 2.2vw, 36px)', lineHeight: 1.2 }}
                >
                  常见问题
                </h2>
                <p className="mt-4 max-w-sm text-body leading-relaxed text-ink-mid">
                  接入前后最常被问到的几件事，答的都是平台现在实际的做法。
                </p>

                <div className="mt-6 flex flex-col gap-2 text-body">
                  <Link
                    href="/docs/faq"
                    className="inline-flex items-center gap-1.5 font-medium text-brand transition-colors hover:text-brand-hover"
                  >
                    查看全部问题
                    <span aria-hidden>→</span>
                  </Link>
                  {/*
                    md 4.1 第 ⑨ 项要求首页有注册登录入口：
                    页尾这块再放一个普通文字链接就够，不必是整页最大的那个按钮。
                  */}
                  <span className="text-ink-mid">
                    还没有账号？
                    <Link
                      href={registerUrl}
                      className="ml-1 font-medium text-brand transition-colors hover:text-brand-hover"
                    >
                      直接注册
                    </Link>
                  </span>
                </div>
              </div>

              <FaqAccordion items={faqItems} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/* ============================ 图标 ============================ */

/**
 * 开发者卡：插头。写的是「接入」，就用插头，别用窗口截图——
 * 窗口里的东西在这个尺寸下看不清，只剩下一个方框。
 */
function PlugIcon() {
  return (
    <>
      <path d="M9 3v3.6M15 3v3.6" />
      <path d="M6.8 6.6h10.4v3.6a5.2 5.2 0 0 1-10.4 0z" strokeLinejoin="round" />
      <path d="M12 15.4v5.4" />
    </>
  );
}

/** 模型卡：火箭。「探索」是个动作，箭头太弱，用个起飞的形状。 */
function RocketIcon() {
  return (
    <>
      <path d="M12 2.6c2.7 2 4.2 5.1 4.2 8.4 0 1.6-.4 3.1-1.1 4.4H8.9a9.7 9.7 0 0 1-1.1-4.4c0-3.3 1.5-6.4 4.2-8.4z" strokeLinejoin="round" />
      <circle cx="12" cy="9.4" r="1.6" />
      <path d="M8.9 15.4 7.2 18.9l3.1-1.1M15.1 15.4l1.7 3.5-3.1-1.1" strokeLinejoin="round" />
      <path d="M12 15.2v4.6" />
    </>
  );
}

/** 定价卡：价签。比账单更像「看价」，也比钱币符号不土。 */
function PriceTagIcon() {
  return (
    <>
      <path d="M20.4 13.1 13.1 20.4a1.9 1.9 0 0 1-2.7 0l-6.9-6.9V3.6h9.9l6.9 6.9a1.9 1.9 0 0 1 .1 2.6z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  );
}

/**
 * 关于卡：两栋楼。
 * 先试过罗盘，26px 下只剩一个带斜线的圆圈，读不出「我们是谁」；
 * 楼这个形状在同样尺寸下轮廓清楚，也和插头、火箭、价签不是一路。
 */
function CompanyIcon() {
  return (
    <>
      <path d="M4.6 20.2V6.4L11.4 3.8v16.4" strokeLinejoin="round" />
      <path d="M11.4 9.6l7.9 2.4v8.2" strokeLinejoin="round" />
      <path d="M3.2 20.2h17.5" strokeLinecap="round" />
      <path
        d="M7.5 8.8h.01M7.5 12h.01M7.5 15.2h.01M15.2 14.4h.01M15.2 17.2h.01"
        strokeLinecap="round"
      />
    </>
  );
}


