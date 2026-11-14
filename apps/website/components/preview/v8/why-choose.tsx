/**
 * 「为什么选择虫洞 AI」——插在「模型与价格」广告栏之前的一屏。
 *
 * 2026-11-14 改了三版才定下来，前两版都被判「AI 味」：
 *   ① 第一版：深色大卡 + 四张图标卡，口号式文案 —— 用户说「狗屁文案」；
 *   ② 第二版：照硅基流动的结构，两张浅底大卡带按钮 + 四张浅灰卡 —— 用户说「AI 味爆炸」；
 *   ③ 本版：**按 docs/design-playbook 的硬规则重做**，而不是继续模仿别人的站。
 *
 * 为什么前两版会有 AI 味：卡片网格 + 图标方块 + 圆角块 + 按钮箭头，
 * 正好是 playbook 第 4/10/11 条点名的三个形状特征（盒子套盒子、箭头粘字、卡片墙）。
 * 硅基流动自己也在用这些形状——模仿它等于复制 AI 味，所以这版不抄它了。
 *
 * 本版做法：
 *   - 不用卡片：改成「细线分隔的定义列表」，标题在左、一句话在右；
 *   - 不用图标：四条理由本身够短，图标只是装饰；
 *   - 链路文字不带箭头（第 10 条）；
 *   - 颜色全部走令牌（surface / line / ink / brand），不写裸色值（第 1 条）；
 *   - 整屏中文控制在 150 字以内（第 9 条）；
 *   - 不编数字、不编证言（第 8 条）。
 */

import Link from 'next/link';

const REASONS = [
  {
    title: '三种协议，一个地址',
    desc: 'OpenAI、Claude、Gemini 共用同一套 base_url，换客户端只改地址和密钥。',
  },
  {
    title: '按量计费，账目可查',
    desc: '单价与账单同源，每次调用扣了多少，都能追到具体请求。',
  },
  {
    title: '上游出错会自动换线',
    desc: '网关后面挂多条线路，一条不通就换下一条；每个 Key 的额度互相隔离。',
  },
  {
    title: '可以放在自己机器上',
    desc: '整套服务支持私有化部署，请求与数据不经过第三方。',
  },
];

export function WhyChoose() {
  return (
    <section id='why-choose' className='border-b border-line py-16 md:py-24'>
      <div className='mx-auto max-w-[1280px] px-6'>
        <h2 className='max-w-[720px] text-[34px] leading-[1.15] font-semibold tracking-tight text-ink sm:text-[48px]'>
          为什么选择虫洞 AI
        </h2>
        <p className='mt-4 max-w-[560px] text-body leading-relaxed text-ink-mid'>
          下面四条都不需要相信我们说的话，在控制台里都能自己核对。
        </p>

        <dl className='mt-10 border-t border-line'>
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className='grid gap-2 border-b border-line py-6 md:grid-cols-[280px_1fr] md:gap-10 md:py-7'
            >
              <dt className='text-lg font-semibold tracking-tight text-ink'>
                {reason.title}
              </dt>
              <dd className='text-body leading-relaxed text-ink-mid'>
                {reason.desc}
              </dd>
            </div>
          ))}
        </dl>

        <div className='mt-8 flex flex-wrap items-center gap-8 text-sm font-medium'>
          <Link
            href='/docs'
            className='text-brand underline-offset-4 transition-colors hover:underline'
          >
            接入文档
          </Link>
          <Link
            href='/pricing'
            className='text-brand underline-offset-4 transition-colors hover:underline'
          >
            价格表
          </Link>
        </div>
      </div>
    </section>
  );
}
