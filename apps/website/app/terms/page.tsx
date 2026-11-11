import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { brand } from '@/lib/brand';

/**
 * 服务协议页。
 *
 * 只写平台确实在做的事（统一接口转发、预充值按量计费、账号与 Key 自持），
 * 分成比例、退款细则这类要商务与法务定的条款不往里写，定了再补。
 * 页脚「服务协议」原先指向 404，这个页面就是给那条链接用的。
 */
export const metadata = { title: '服务协议' };

const SECTIONS = [
  {
    title: '一、协议范围',
    body: [
      `本协议是你与${brand.name}平台运营主体（下称「我们」）之间，就使用本平台服务所达成的约定。`,
      '注册账号、创建 API Key 或调用本平台任一接口，即表示你已阅读并同意本协议。若你代表企业或其他组织使用本服务，你应确认已获得相应授权。',
    ],
  },
  {
    title: '二、账号与安全',
    body: [
      '注册时应提供真实、有效且由你本人控制的邮箱或手机号。账号信息不实导致无法接收通知或无法找回账号的，后果由你自行承担。',
      '账号、登录凭证与 API Key 由你自行保管。凡通过你的账号或 API Key 发起的调用，均视为你的行为并由你承担相应费用。',
      '发现账号或 Key 泄露，应立即在控制台作废对应 Key，并通过「关于」页所列方式联系我们。',
    ],
  },
  {
    title: '三、服务内容',
    body: [
      '平台将你的请求转发至第三方模型服务商，并把结果按统一接口格式返回。可用的模型与参数以「模型广场」和「价格」页展示为准，我们会随上游情况调整模型清单。',
      '上游模型的输出内容由相应服务商提供，我们不保证其准确性、完整性或适用于特定用途。',
    ],
  },
  {
    title: '四、使用规范',
    body: [
      '不得利用本服务从事违法违规活动，或生成、传播法律法规禁止的内容。',
      '不得对平台进行攻击、扫描、压测，或以任何方式绕过计费、伪造用量。',
      '不得将账号或 API Key 转售、出借给未获授权的第三方，也不得以自动化方式批量注册账号。',
      '违反上述约定的，我们可暂停或终止服务，并保留追究责任的权利。',
    ],
  },
  {
    title: '五、费用与结算',
    body: [
      '平台采用预充值、按实际用量扣减的结算方式。各模型的计费单价以「价格」页与控制台展示为准，价格调整会提前在站内公告。',
      '账户余额仅用于抵扣本平台服务费用，不计利息，不可转让。',
    ],
  },
  {
    title: '六、服务变更、中断与终止',
    body: [
      '我们会尽力保持服务连续，但计划内维护、上游服务商中断、网络故障及不可抗力都可能造成短时不可用。',
      '你可以随时停止使用并申请注销账号；账号注销后，未消耗的余额与历史记录按本协议及隐私政策处理。',
    ],
  },
  {
    title: '七、知识产权',
    body: [
      '平台的界面、文档、商标与程序代码归我们或相应权利人所有，未经许可不得复制、修改或用于商业目的。',
      '你提交的请求内容与获得的输出，其权利归属按法律法规及上游服务商条款确定；你应确保提交内容不侵犯他人权利。',
    ],
  },
  {
    title: '八、责任限制',
    body: [
      '在法律允许的范围内，我们不对因使用或无法使用本服务造成的间接损失、利润损失承担责任。',
      '基于上游模型输出做出的业务决策，其风险由你自行评估与承担。',
    ],
  },
  {
    title: '九、协议修改与争议解决',
    body: [
      '本协议更新后会在站内公告，公告期满继续使用服务视为接受更新后的协议。',
      '本协议适用中华人民共和国法律。争议双方应先协商解决；协商不成的，提交平台运营主体所在地有管辖权的人民法院。',
    ],
  },
];

export default function TermsPage() {
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
              LEGAL · 服务协议
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              服务协议
            </h1>
            <p className="mt-3 text-[13px] text-ink-mid">更新日期：2026 年 11 月 11 日</p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-[14px] leading-[1.9] text-ink-mid">
            这份协议说明你在使用 {brand.name} 时双方各自的权利与义务。条款按顺序编号，
            与页面上的功能一一对应，没有需要另行确认的隐藏约定。
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
            对本协议有疑问，可通过「关于」页列出的联系方式与我们沟通；涉及账号与数据的请求，
            我们会核对身份后处理。
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
