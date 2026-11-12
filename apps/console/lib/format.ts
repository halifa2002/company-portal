/**
 * 金额与时间格式化
 *
 * 单一真源在 `@portal/api-client/src/format.ts`（md 第六章原则 4）。
 * 这里只做转出，保留 `@/lib/format` 这个历史导入路径，页面不用改。
 */

export {
  ensureMoneySettings,
  moneyUnit,
  quotaToAmount,
  quotaToAmountValue,
  usdToDisplay,
  amountToQuota,
  formatTime,
  formatNumber,
} from '@portal/api-client';

/**
 * 官方 group 字段是「计费分组」：不同分组的价格倍率与可用模型不同，由管理员分配，用户改不了。
 * 直接给用户看 `default` 等于甩了个内部词，这里换成「标准档 / xx 档」。
 * 注意：分组名是后端配置的，除了 default 之外一律原样显示，不猜语义。
 */
export function groupLabel(group: string | undefined | null): string {
  if (!group || group === 'default') return '标准档';
  return `${group} 档`;
}

/**
 * 给客户看的密钥统一带上 `sk-` 前缀。
 *
 * 后端 `common.GenerateKey()` 生成的是 48 位随机串，本身没有前缀；但 `sk-` 是行业
 * 默认写法，官网文档（docs/auth、docs/integrations、代码示例）也都写着「以 sk- 开头」。
 * 两边不能各说一套：这里在展示与复制时补上前缀，客户拿到的就是文档里那种形态。
 *
 * 安全前提：后端鉴权会先 `strings.TrimPrefix(key, "sk-")` 再比对
 * （middleware/auth.go、controller/token.go、service/quota.go），所以带前缀与不带
 * 前缀都能通过——补前缀只是显示层的事，不改后端生成逻辑，也不影响跟随官方升级。
 */
export function keyForDisplay(key: string | undefined | null): string {
  const value = (key ?? '').trim();
  if (!value) return '';
  return value.startsWith('sk-') ? value : `sk-${value}`;
}
