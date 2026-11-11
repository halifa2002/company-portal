import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { brand } from '@/lib/brand';

/**
 * 隐私政策页。
 *
 * 只写平台实际会碰到的数据：账号信息、登录与调用元数据、充值订单，
 * 以及这些数据放在哪里、谁能看、怎么删。不写「绝不共享」这类
 * 与委托处理（云服务商、支付渠道）冲突的绝对化措辞。
 */
export const metadata = { title: '隐私政策' };

const SECTIONS = [
  {
    title: '一、适用范围',
    body: [
      `本政策说明${brand.name}在你的账号与调用过程中收集哪些信息、用于什么目的、保存多久，以及你可以如何处置这些信息。`,
      '本政策适用于官网、用户控制台与 API 网关；控制台内集成的第三方支付页面按其自身政策处理信息。',
    ],
  },
  {
    title: '二、我们收集的信息',
    body: [
      '账号信息：注册与登录使用的邮箱或手机号、昵称、密码（以不可逆方式存储）、双因素认证的绑定状态。',
      '登录与安全信息：登录时间、IP 地址、设备与浏览器标识、登录失败记录，用于识别异常登录。',
      '调用记录：请求时间、所用模型、token 用量、耗时、状态码与错误信息，用于计费、排障与容量规划。请求与返回的具体内容是否留存，取决于你在控制台打开的日志设置。',
      '充值信息：订单号、金额、支付渠道返回的结果。银行卡号、支付密码等支付要素由支付渠道处理，我们不接触也不存储。',
    ],
  },
  {
    title: '三、使用目的',
    body: [
      '提供服务并完成计费结算；排查故障与处理你的技术支持请求；识别异常登录、盗用与滥用，保障账号与平台安全；履行法律法规要求的义务。',
      '我们可能用去除身份标识后的汇总数据了解各类模型的整体用量，用于容量与产品改进，这类统计不指向具体个人。',
    ],
  },
  {
    title: '四、存储与保护',
    body: [
      '上述信息存储于中华人民共和国境内的服务器。',
      '传输过程使用加密通道；内部按最小必要原则授权访问，并对管理操作保留审计记录；密码等凭证不以明文形式存储。',
      '任何系统都无法保证绝对安全。发生可能影响你权益的安全事件时，我们会按法律要求告知你并报告主管部门。',
    ],
  },
  {
    title: '五、委托处理与共享',
    body: [
      '为提供服务，我们会委托云服务商、支付渠道等受托方处理必要的信息，并通过协议约束其仅按我们的指示处理。',
      '除下列情形外，我们不会向第三方提供你的个人信息：取得你的单独同意；法律法规要求或司法机关、行政机关依法调取；为保护你或他人的生命、财产等重大合法权益所必需。',
      '我们不出售你的个人信息。',
    ],
  },
  {
    title: '六、保存期限',
    body: [
      '账号信息在账号存续期间保存；注销后，除法律法规要求保留的部分（如交易与计费记录）外，我们会在合理期限内删除或作匿名化处理。',
      '调用日志按控制台的日志保留设置到期清理。',
    ],
  },
  {
    title: '七、你的权利',
    body: [
      '你可以在控制台查询与更正账号资料、导出调用记录、作废 API Key、注销账号，也可以要求我们删除对应的个人信息。',
      '对信息处理有异议或需要行使上述权利，可通过「关于」页列出的联系方式提出；我们会在核对身份后处理并回复。',
    ],
  },
  {
    title: '八、Cookie 与本地存储',
    body: [
      '官网与控制台使用必要的 Cookie 或本地存储保持登录状态、记住语言与界面偏好。清除浏览器数据后需重新登录。',
    ],
  },
  {
    title: '九、未成年人',
    body: [
      '本服务面向企业与开发者。未满 14 周岁的未成年人不得注册使用；若我们发现误收集了此类信息，会尽快删除。',
    ],
  },
  {
    title: '十、政策更新',
    body: [
      '本政策更新后会在站内公告。涉及你权利的重大变更，我们会以更显著的方式提示。',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section
          className="border-b border-black/5"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="text-xs font-medium tracking-[0.08em] text-brand">
              LEGAL · 隐私政策
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              隐私政策
            </h1>
            <p className="mt-3 text-[13px] text-ink-mid">更新日期：2026 年 11 月 11 日</p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-[14px] leading-[1.9] text-ink-mid">
            用这个平台需要账号、需要计费、需要排查故障，所以必然会碰到一些信息。
            这份政策把「碰到了什么、为什么碰、放多久、你能否删掉」逐条写清楚。
          </p>

          <div className="mt-10 space-y-9">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-[16px] font-semibold tracking-tight text-ink">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-2.5">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-[14px] leading-[1.9] text-ink-mid">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-12 rounded-2xl border border-line bg-surface-tint px-5 py-4 text-[13px] leading-relaxed text-ink-mid">
            对信息处理有疑问，或需要查询、更正、删除你的信息，可通过「关于」页列出的联系方式联系我们。
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
