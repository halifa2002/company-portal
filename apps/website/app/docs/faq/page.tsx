import Link from 'next/link';
import { DocsShell } from '@/components/docs-shell';

export const metadata = { title: '常见问题' };

/** 一条问答：问题加粗，正文可以直接塞链接与代码 */
function Q(props: { q: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-card border border-line bg-white p-4">
      <h3 className="text-body font-semibold text-ink">{props.q}</h3>
      <div className="mt-1.5 text-body leading-relaxed text-ink-mid">{props.children}</div>
    </div>
  );
}

/** 常见问题：只答实际会被问到的、平台现在确实这么做的 */
export default function FaqPage() {
  return (
    <DocsShell>
      <h1 className="text-display font-bold tracking-tight text-ink">常见问题</h1>
      <p className="mt-3 max-w-2xl text-body leading-relaxed text-ink-mid">
        接入前后最常被问到的十几件事。接口细节在
        <Link href="/docs/api" className="mx-1 text-brand hover:underline">
          接口速查
        </Link>
        ，报错原因在
        <Link href="/docs/errors" className="mx-1 text-brand hover:underline">
          错误码
        </Link>
        。
      </p>

      <section id="account" className="mt-9 scroll-mt-24">
        <h2 className="text-heading font-bold text-ink">账号与充值</h2>

        <Q q="怎么注册账号？">
          在控制台点「注册」，填用户名和密码即可，注册完成后可自助登录。新账号余额为
          0，调用前需要先充值。
        </Q>

        <Q q="怎么充值？">
          控制台「钱包」页输入兑换码，兑换成功后余额立即更新。目前没有接入在线支付通道，
          充值走兑换码这一条路。
        </Q>

        <Q q="余额和消费在哪看？">
          顶栏一直显示当前余额；「首页」看今日与本月消费、调用次数和趋势；每一笔明细在
          「消费记录」。
        </Q>
      </section>

      <section id="key" className="mt-9 scroll-mt-24">
        <h2 className="text-heading font-bold text-ink">Key 与权限</h2>

        <Q q="怎么创建 API Key？">
          控制台「密钥」→ 新建，填名称；额度可以填具体数值，也可以勾「不限额度」；
          模型权限选「全部模型」或「仅指定模型」，选后者时至少要挑一个模型。
        </Q>

        <Q q="为什么完整的 Key 只显示一次？">
          安全设计：页面离开后只保留前缀和状态，服务端按官方机制加密保存，不再回传明文。
          如果没存下来，删掉这把重建一把即可，旧 Key 立即失效。
        </Q>

        <Q q="一个账号可以建几把 Key？">
          可以建多把，建议按项目或环境分开。每把能单独设额度和可用模型，某一把泄露时只删
          那一把，不影响其他业务。
        </Q>

        <Q q="提示「额度耗尽」怎么办？">
          这是这把 Key 自己的额度用完了，不是账户余额不足。调高它的额度，或者新建一把；
          账户余额不足时报的是 403，处理方式不同。
        </Q>
      </section>

      <section id="call" className="mt-9 scroll-mt-24">
        <h2 className="text-heading font-bold text-ink">调用与报错</h2>

        <Q q="已有的 OpenAI 代码要改哪里？">
          只改两处：base_url 换成文档首页显示的网关地址（带
          <code className="mx-1 rounded bg-black/5 px-1 py-0.5 font-mono text-note">/v1</code>），
          api_key 换成平台 Key。其余参数、SDK、调用方式都不用动。完整示例见
          <Link href="/docs/quickstart" className="mx-1 text-brand hover:underline">
            快速开始
          </Link>
          。
        </Q>

        <Q q="401、403、429、503 分别是什么意思？">
          401 是 Key 有问题（缺失、打错、已删除，或这把 Key 额度用完）；403 是账户余额不足；
          429 是被限流，隔一会儿再来；503 是模型不可用，多半是模型名不对或该模型暂时没有
          可用渠道。逐条对照见
          <Link href="/docs/errors" className="mx-1 text-brand hover:underline">
            错误码
          </Link>
          。
        </Q>

        <Q q="请求很久不返回，或者客户端超时？">
          长文本建议开流式输出（<code className="rounded bg-black/5 px-1 py-0.5 font-mono text-note">stream: true</code>），
          首字节会明显更早到达；同时把客户端超时放宽到分钟级，别用默认的几十秒。
        </Q>

        <Q q="提示上下文超长？">
          说明输入加输出的长度超过了该模型的上限。缩短输入，或在模型广场挑一个上下文更长的
          模型——每张模型卡上都标了上下文长度。
        </Q>
      </section>

      <section id="bill" className="mt-9 scroll-mt-24">
        <h2 className="text-heading font-bold text-ink">计费与账单</h2>

        <Q q="按什么计费？">
          按 token 计费，输入和输出分开计价。部分模型分时段：工作日白天按高峰价，其余时间
          按空闲价，按调用实际发生的时间段结算。缓存命中的输入按缓存价，比普通输入便宜。
          单价以
          <Link href="/pricing" className="mx-1 text-brand hover:underline">
            价格页
          </Link>
          为准。
        </Q>

        <Q q="被拒绝的请求会收费吗？">
          不会。认证失败、余额不足、模型不可用这类被拒绝的请求不产生费用。
        </Q>

        <Q q="在哪核对每一笔扣费？">
          「消费记录」逐条列出时间、模型、输入与输出 token、金额、请求状态和请求标识；
          「用量统计」按天汇总，可以按模型和 Key 维度看。两边数字都来自后端账单，不是前端
          自己算的。
        </Q>

        <Q q="价格以后会变吗？">
          价格页的数据实时取自后端，费用按调用发生时的价格结算，不会按新价格回头改旧账。
          调整会记在
          <Link href="/docs/changelog" className="mx-1 text-brand hover:underline">
            更新记录
          </Link>
          里。
        </Q>
      </section>
    </DocsShell>
  );
}
