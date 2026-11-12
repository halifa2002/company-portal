'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokensApi, modelsApi, ApiError } from '@portal/api-client';
import type { Token } from '@portal/types';
import {
  Badge,
  Button,
  ConfirmDialog,
  Field,
  Input,
  Modal,
  Select,
  TableWrap,
  THead,
  Th,
  Tr,
  Td,
  TdSub,
  Textarea,
} from '@portal/ui';
import { ConsoleSidebar, ConsoleTopbar } from '@/components/console-chrome';
import {
  BlockLoading,
  EmptyHint,
  ErrorBox,
  PLACEHOLDER_DASH,
  TableLoading,
} from '@/components/data-state';
import { PageContainer } from '@/components/page-shell';
import { amountToQuota, ensureMoneySettings, formatTime, keyForDisplay, moneyUnit, quotaToAmount, quotaToAmountValue } from '@/lib/format';

/**
 * API 密钥管理 —— md 4.2 C
 *
 * 覆盖要求：创建 / 删除 / 状态 / 名称 / 额度 / 模型权限 / 创建时间 / 最后使用时间 /
 * 只完整展示一次 / 删除二次确认 / 后端校验。
 *
 * 额度换算：官方用整数 quota 记账；1 单位货币折算多少 quota、是否再乘汇率，
 * 都从后端 /api/status 取（见 lib/format.ts 的 ensureMoneySettings）。
 * 用户按界面显示的单位填金额，提交前由 amountToQuota 换算回 quota。
 *
 * 2026-11-12 改版：改用 @portal/ui 的按钮/输入/表格/弹窗零件。
 * 原来的 10 列改成 7 列——「分组」永远是 default，「模型」只有「全部 / 限定 N 个」
 * 两种答案，各占一整列太浪费；创建时间折进名称下面，最后使用单列。
 * 这两个时间字段在 1280 笔记本上原来是被隐藏的，而 4.2 C 明确要求它们可见。
 */

const STATUS_LABEL: Record<number, string> = {
  1: '启用',
  2: '禁用',
  3: '已过期',
  4: '额度耗尽',
};

/** 状态 → 标签语气。用语义色，不再写 bg-green-50。 */
const STATUS_TONE: Record<number, 'success' | 'neutral' | 'warning' | 'danger'> = {
  1: 'success',
  2: 'neutral',
  3: 'warning',
  4: 'danger',
};

interface Draft {
  id?: number;
  name: string;
  unlimited: boolean;
  amount: string;
  limitModels: boolean;
  selected: string[];
  /** IP 白名单，一行一个，支持 CIDR；空表示不限制来源 */
  allowIps: string;
  /** 过期天数：-1 永不过期，0 保持原到期时间，正数表示从现在起 N 天 */
  expireDays: number;
  /** 编辑时原来的到期时间戳，expireDays=0 时原样写回 */
  originalExpire: number;
}

const EMPTY_DRAFT: Draft = {
  name: '',
  unlimited: true,
  amount: '',
  limitModels: false,
  selected: [],
  allowIps: '',
  expireDays: -1,
  originalExpire: -1,
};

/**
 * 编辑时到期时间默认「保持原到期时间」（expireDays = 0）。
 *
 * 以前这里按「剩余天数离 7 / 30 / 90 天差不到 1.5 天」去反推档位，保存时再按
 * 「从现在起 N 天」重算——于是点开编辑、什么都不改、点保存，到期时间就被往后推。
 * 档位靠猜本身就是错的：后端存的是一个绝对时间点，界面没有理由把它折成档位。
 */

export default function KeysPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /** 列表拉取失败。和「新建密钥失败」这类操作错误分开：前者该带重试，后者不该 */
  const [loadFailed, setLoadFailed] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState<{ name: string; key: string } | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | number>('all');
  const [page, setPage] = useState(1);
  /** 待删除的密钥。有值就弹确认框——不再用浏览器原生 confirm。 */
  const [pendingDelete, setPendingDelete] = useState<Token | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (): Promise<Token[] | null> => {
    setLoading(true);
    setError('');
    setLoadFailed(false);
    try {
      await ensureMoneySettings();
      const [list, models] = await Promise.all([
        tokensApi.listTokens({ page: 1, page_size: 100 }),
        modelsApi.listUserModels().catch(() => [] as string[]),
      ]);
      const items = list.items ?? [];
      setTokens(items);
      setAvailableModels(Array.isArray(models) ? models : []);
      // 返回这一批，供「新建后要认出新建的那一把」使用，省一次重复请求
      return items;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return null;
      }
      setLoadFailed(true);
      setError('数据加载失败，稍等片刻再试一次');
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * 官方 /api/token/ 只有分页、没有按名称或状态的筛选参数，
   * 因此一次取前 100 个在页面里筛，再本地分页。
   */
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return tokens.filter((token) => {
      if (statusFilter !== 'all' && token.status !== statusFilter) return false;
      if (!keyword) return true;
      return (
        token.name.toLowerCase().includes(keyword) ||
        token.key.toLowerCase().includes(keyword)
      );
    });
  }, [tokens, query, statusFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  /** 过期时间：-1 表示永不过期，其余按时间显示 */
  function expireText(expiredTime: number): string {
    if (!expiredTime || expiredTime < 0) return '永不过期';
    const expired = expiredTime * 1000 < Date.now();
    return expired ? '已过期' : formatTime(expiredTime);
  }

  function openCreate() {
    setDraft({ ...EMPTY_DRAFT });
    setError('');
  }

  function openEdit(token: Token) {
    setDraft({
      id: token.id,
      name: token.name,
      unlimited: token.unlimited_quota,
      // 回填保留 4 位小数、不带千分位（输入框要用 Number() 读回）。
      // 原来固定 2 位：1.2345 回填成 1.23，用户只是点开编辑再保存，额度就被悄悄改少了。
      amount: token.unlimited_quota
        ? ''
        : Number(quotaToAmountValue(token.remain_quota).toFixed(4)).toString(),
      limitModels: token.model_limits_enabled,
      selected: token.model_limits_enabled
        ? token.model_limits.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      allowIps: token.allow_ips ?? '',
      expireDays: 0,
      originalExpire: token.expired_time,
    });
    setError('');
  }

  async function handleSave() {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      setError('请填写名称');
      return;
    }
    if (!draft.unlimited && !(Number(draft.amount) > 0)) {
      setError('请填写大于 0 的额度，或勾选不限额度');
      return;
    }
    if (draft.limitModels && draft.selected.length === 0) {
      setError('选择了「仅指定模型」时，至少要选一个模型');
      return;
    }

    const payload = {
      name,
      unlimited_quota: draft.unlimited,
      remain_quota: draft.unlimited ? 0 : amountToQuota(Number(draft.amount)),
      expired_time:
        draft.expireDays === -1
          ? -1
          : draft.expireDays === 0
            ? draft.originalExpire
            : Math.floor(Date.now() / 1000) + draft.expireDays * 86400,
      model_limits_enabled: draft.limitModels,
      model_limits: draft.limitModels ? draft.selected.join(',') : '',
      allow_ips: draft.allowIps.trim(),
    };

    const creating = !draft.id;
    /** 新建前记下现有 id：创建成功后「多出来的那把」就是新建的，靠它去取完整密钥 */
    const existingIds = new Set(tokens.map((token) => token.id));

    setSaving(true);
    setError('');
    try {
      if (draft.id) {
        await tokensApi.updateToken({ id: draft.id, ...payload });
      } else {
        await tokensApi.createToken(payload);
      }
      setDraft(null);
      const items = await load();

      // 创建接口只返回成功、不返回密钥本身，所以立刻按新 id 取一次并直接展示。
      // 以前创建完什么都不给，用户以为没拿到；列表里又能随时「查看」，文案自相矛盾。
      if (creating && items) {
        const created = items.find((token) => !existingIds.has(token.id));
        if (created) {
          try {
            const data = await tokensApi.revealTokenKey(created.id);
            setRevealed({ name: created.name, key: keyForDisplay(data.key) });
            setCopied(false);
          } catch {
            // 密钥已经建好了，只是完整密钥这次没读出来——不能让用户以为创建失败去重试
            setError('密钥已创建。完整密钥暂时没读到，请在列表里点「查看」复制。');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleReveal(token: Token) {
    try {
      const data = await tokensApi.revealTokenKey(token.id);
      setRevealed({ name: token.name, key: keyForDisplay(data.key) });
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法读取密钥');
    }
  }

  /** md 安全要求：删除必须二次确认。确认框里写清「谁会立刻受影响」。 */
  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await tokensApi.deleteToken(pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  /** 表格与手机列表共用的状态标签 */
  function renderStatus(status: number) {
    return (
      <Badge tone={STATUS_TONE[status] ?? 'neutral'}>
        {STATUS_LABEL[status] ?? status}
      </Badge>
    );
  }

  return (
    <div className="min-h-screen md:pl-56">
      <ConsoleSidebar />
      {/*
        标题就单独一行，下面不挂说明。
        2026-11-12 先加过一句 subtitle，用户看过说「标题就孤零零的不就行了」——
        这一页表格自己会说话（名称/状态/额度都在列里），不用再解释一遍。
        ConsoleTopbar 的 subtitle 能力留着，别的页还在用。
      */}
      <ConsoleTopbar title="API 密钥" />

      <PageContainer>
        {error && !draft && (
          <div className="mb-5">
            {loadFailed ? (
              <ErrorBox message={error} onRetry={() => void load()} retrying={loading} />
            ) : (
              <div className="rounded-control border border-danger/25 bg-danger-soft px-4 py-3 text-note text-danger-text">
                {error}
              </div>
            )}
          </div>
        )}

        {/*
          这里原本挂着两行解释（「应用通过密钥调用本平台。每把密钥可以单独限额、
          限定模型，因此给不同应用各建一把，出问题好定位。」），
          用户 2026-11-12 说「解释词怪怪的」，直接删掉；
          标题下面那句短说明改由顶栏 subtitle 承担，和其他页面同一位置。

          「新建密钥」原来单独占一行、孤零零吊在右上角，现在并进下面那条工具条，
          靠右停在条数旁边——工具条左边是「找哪个」，右边是「加一个」，一眼看全。
        */}

        {/* 完整密钥：只在创建后或点「查看」时出现 */}
        {revealed && (
          <div className="mb-5 rounded-card border border-warn/30 bg-warn-soft p-card">
            <div className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warn text-meta font-bold text-white"
              >
                !
              </span>
              <div className="min-w-0">
                <div className="text-body font-medium text-ink">
                  「{revealed.name}」的完整密钥
                </div>
                <div className="mt-0.5 text-meta leading-normal text-warn-text">
                  请妥善保管、不要外发。关掉后随时可以在列表里点「查看」再次复制。
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto rounded-control border border-warn/25 bg-surface px-3 py-2 font-mono text-note text-ink">
                {revealed.key}
              </code>
              <Button
                size="sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(revealed.key);
                  setCopied(true);
                  // 3 秒后回到「复制」：原来点了就一直显示「已复制」，
                  // 用户过一会儿再点一次，以为没生效
                  window.setTimeout(() => setCopied(false), 3000);
                }}
              >
                {copied ? '已复制' : '复制'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setRevealed(null)}>
                我已保存
              </Button>
            </div>
          </div>
        )}

        {/* 工具条：搜索 + 状态筛选（左），条数 + 新建（右） */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="按名称或密钥搜索"
              aria-label="按名称或密钥搜索"
              className="w-60"
            />
            <Select
              value={String(statusFilter)}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value === 'all' ? 'all' : Number(value));
                setPage(1);
              }}
              aria-label="按状态筛选"
              className="w-auto"
            >
              <option value="all">全部状态</option>
              <option value="1">启用</option>
              <option value="2">禁用</option>
              <option value="3">已过期</option>
              <option value="4">额度耗尽</option>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-meta text-ink-muted">
              {loading
                ? '正在统计…'
                : loadFailed
                  ? '个数未知'
                  : filtered.length === tokens.length
                    ? `共 ${tokens.length} 个`
                    : `筛选出 ${filtered.length} 个 / 共 ${tokens.length} 个`}
            </span>
            <Button onClick={openCreate}>新建密钥</Button>
          </div>
        </div>

        {/* 桌面端表格（xl 以上）。窄屏换成下面的卡片列表，不是把列藏起来。 */}
        <div className="hidden xl:block">
          <TableWrap>
            <THead>
              <Th>名称</Th>
              <Th>状态</Th>
              <Th>密钥</Th>
              <Th>额度</Th>
              <Th>最后使用</Th>
              <Th>过期</Th>
              <Th align="right">操作</Th>
            </THead>
            <tbody>
              {loading ? (
                <TableLoading colSpan={7} rows={4} />
              ) : loadFailed ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyHint
                      text="暂时读不到密钥列表"
                      hint="可能是网络波动，稍等片刻再试一次"
                    />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyHint
                      text={tokens.length === 0 ? '还没有密钥' : '没有匹配的密钥'}
                      hint={
                        tokens.length === 0
                          ? '创建一把密钥，就能开始调用模型'
                          : '清掉筛选条件或换个关键词看看'
                      }
                    />
                  </td>
                </tr>
              ) : (
                paged.map((token) => {
                  const limited = token.model_limits.split(',').filter(Boolean).length;
                  return (
                    <Tr key={token.id}>
                      <Td>
                        <span className="block font-medium text-ink">{token.name}</span>
                        <TdSub>
                          {token.created_time
                            ? `创建 ${formatTime(token.created_time)}`
                            : `创建 ${PLACEHOLDER_DASH}`}
                          {' · '}
                          {token.model_limits_enabled ? `限定 ${limited} 个模型` : '全部模型'}
                        </TdSub>
                      </Td>
                      <Td>{renderStatus(token.status)}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <code className="max-w-[160px] truncate rounded border border-line bg-surface-subtle px-1.5 py-0.5 font-mono text-meta text-ink-mid">
                            {keyForDisplay(token.key)}
                          </code>
                          <button
                            type="button"
                            onClick={() => void handleReveal(token)}
                            className="shrink-0 rounded text-meta font-medium text-brand transition-colors hover:text-brand-hover"
                          >
                            查看
                          </button>
                        </div>
                      </Td>
                      <Td className="tabular-nums">
                        {token.unlimited_quota ? '不限额' : quotaToAmount(token.remain_quota)}
                      </Td>
                      <Td>
                        {token.accessed_time ? (
                          formatTime(token.accessed_time)
                        ) : (
                          <span className="text-ink-muted">从未使用</span>
                        )}
                      </Td>
                      <Td>{expireText(token.expired_time)}</Td>
                      <Td align="right">
                        {/*
                          行内操作降成灰色纯文字：一屏五个蓝色链接等于没有重点。
                          删除单独用危险色，鼠标划过才加深——它不该和「编辑」一样显眼。
                        */}
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(token)}
                            className="rounded text-meta text-ink-mid transition-colors hover:text-ink"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(token)}
                            className="rounded text-meta text-ink-muted transition-colors hover:text-danger-text"
                          >
                            删除
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </tbody>
          </TableWrap>
        </div>

        {/* 窄屏：卡片列表。原来的写法在 xl 以下直接把「创建时间 / 最后使用」隐藏掉，
            而 md 4.2 C 要求这两项必须能看到，所以这里改成换布局而不是删信息。 */}
        <div className="xl:hidden">
          <div className="overflow-hidden rounded-card border border-line bg-surface">
            {loading ? (
              <div className="px-4 py-5">
                <BlockLoading lines={3} />
              </div>
            ) : loadFailed ? (
              <EmptyHint
                text="暂时读不到密钥列表"
                hint="可能是网络波动，稍等片刻再试一次"
              />
            ) : filtered.length === 0 ? (
              <EmptyHint
                text={tokens.length === 0 ? '还没有密钥' : '没有匹配的密钥'}
                hint={
                  tokens.length === 0
                    ? '点右上角「新建密钥」，建完就能拿它调模型'
                    : '把状态筛选或搜索词清掉再看'
                }
              />
            ) : (
              <div className="divide-y divide-line">
                {paged.map((token) => {
                  const limited = token.model_limits.split(',').filter(Boolean).length;
                  return (
                    <div key={token.id} className="space-y-3 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-body font-medium text-ink">
                            {token.name}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="min-w-0 truncate rounded border border-line bg-surface-subtle px-1.5 py-0.5 font-mono text-meta text-ink-mid">
                              {keyForDisplay(token.key)}
                            </code>
                            <button
                              type="button"
                              onClick={() => void handleReveal(token)}
                              className="shrink-0 rounded text-meta font-medium text-brand"
                            >
                              查看
                            </button>
                          </div>
                        </div>
                        {renderStatus(token.status)}
                      </div>

                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-meta">
                        <div className="flex justify-between gap-2">
                          <dt className="text-ink-muted">额度</dt>
                          <dd className="truncate tabular-nums text-ink">
                            {token.unlimited_quota ? '不限额' : quotaToAmount(token.remain_quota)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-ink-muted">模型</dt>
                          <dd className="truncate text-ink">
                            {token.model_limits_enabled ? `限定 ${limited} 个` : '全部'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-ink-muted">过期</dt>
                          <dd className="truncate text-ink">{expireText(token.expired_time)}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-ink-muted">创建</dt>
                          <dd className="truncate text-ink">
                            {token.created_time ? formatTime(token.created_time) : PLACEHOLDER_DASH}
                          </dd>
                        </div>
                      </dl>

                      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                        <span className="truncate text-meta text-ink-muted">
                          {token.accessed_time
                            ? `最后使用 ${formatTime(token.accessed_time)}`
                            : '从未使用'}
                        </span>
                        <div className="flex shrink-0 items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(token)}
                            className="rounded text-meta text-ink-mid"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(token)}
                            className="rounded text-meta text-ink-muted"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-line px-4 py-3 text-meta text-ink-muted">
                <span>
                  第 {currentPage} / {totalPages} 页
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 桌面端分页条 */}
        {totalPages > 1 && (
          <div className="mt-3 hidden items-center justify-between text-meta text-ink-muted xl:flex">
            <span>
              第 {currentPage} / {totalPages} 页，每页 {pageSize} 条
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                上一页
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </PageContainer>

      {/* 新建 / 编辑弹窗 */}
      {draft && (
        <KeyDialog
          draft={draft}
          setDraft={setDraft}
          models={availableModels}
          saving={saving}
          error={error}
          onCancel={() => setDraft(null)}
          onSave={() => void handleSave()}
        />
      )}

      {/* 删除二次确认：自绘弹窗，写清「谁会立刻断」 */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete ? `删除「${pendingDelete.name}」？` : '删除密钥'}
        description="这个操作不能撤销。"
        detail={
          pendingDelete && (
            <>
              正在用这把密钥的调用<strong className="font-medium text-ink">会立刻报错</strong>，
              需要重新发一把新密钥并替换到应用里。
              <br />
              如果只是暂时不用，可以改成「禁用」。
            </>
          )
        }
        confirmLabel="删除密钥"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function KeyDialog({
  draft,
  setDraft,
  models,
  saving,
  error,
  onCancel,
  onSave,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  models: string[];
  saving: boolean;
  error: string;
  onCancel: () => void;
  onSave: () => void;
}) {
  const isEdit = Boolean(draft.id);
  const unit = moneyUnit();
  const hint = useMemo(() => {
    if (draft.unlimited) return '不限制这把密钥能花多少，最多花到账户余额';
    if (!draft.amount) return `填${moneyUnit()}金额，例如 5 表示这个密钥总共只能花 5 ${moneyUnit()}`;
    return `约 ${Number(draft.amount || 0).toFixed(2)} ${moneyUnit()}`;
  }, [draft.unlimited, draft.amount]);

  function toggleModel(name: string) {
    const has = draft.selected.includes(name);
    setDraft({
      ...draft,
      selected: has
        ? draft.selected.filter((m) => m !== name)
        : [...draft.selected, name],
    });
  }

  return (
    <Modal
      open
      onClose={onCancel}
      busy={saving}
      title={isEdit ? '编辑密钥' : '新建密钥'}
      description={
        isEdit
          ? '改完立刻生效，正在使用该密钥的应用不用改动。'
          : '创建后会立刻显示完整密钥；之后也能在列表里点「查看」再复制。'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            取消
          </Button>
          <Button onClick={onSave} loading={saving} loadingLabel="保存中…">
            {isEdit ? '保存修改' : '创建'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="名称" htmlFor="key-name" hint="建议按用途命名，例如「生产环境」「测试脚本」">
          <Input
            id="key-name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="例如：生产环境"
            autoFocus
            className="w-full"
          />
        </Field>

        {/* 额度 */}
        <div>
          <div className="text-note font-medium text-ink">额度上限</div>
          <div className="mt-1.5 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-body text-ink">
              <input
                type="radio"
                checked={draft.unlimited}
                onChange={() => setDraft({ ...draft, unlimited: true })}
                className="h-4 w-4 accent-[var(--brand-primary)]"
              />
              不限额度
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-body text-ink">
              <input
                type="radio"
                checked={!draft.unlimited}
                onChange={() => setDraft({ ...draft, unlimited: false })}
                className="h-4 w-4 accent-[var(--brand-primary)]"
              />
              限制额度
              <Input
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                disabled={draft.unlimited}
                inputMode="decimal"
                aria-label={`额度金额（${unit}）`}
                placeholder={`金额（${unit}）`}
                density="sm"
                className="w-32 text-note"
              />
            </label>
          </div>
          <p className="mt-1.5 text-meta leading-normal text-ink-muted">{hint}</p>
        </div>

        {/* 模型权限 */}
        <div>
          <div className="text-note font-medium text-ink">可用模型</div>
          <div className="mt-1.5 flex gap-5">
            <label className="flex cursor-pointer items-center gap-2 text-body text-ink">
              <input
                type="radio"
                checked={!draft.limitModels}
                onChange={() => setDraft({ ...draft, limitModels: false })}
                className="h-4 w-4 accent-[var(--brand-primary)]"
              />
              全部模型
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-body text-ink">
              <input
                type="radio"
                checked={draft.limitModels}
                onChange={() => setDraft({ ...draft, limitModels: true })}
                className="h-4 w-4 accent-[var(--brand-primary)]"
              />
              仅指定模型
            </label>
          </div>

          {draft.limitModels && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-control border border-line p-1.5">
              {models.length === 0 ? (
                <p className="py-3 text-center text-meta text-ink-muted">
                  当前档位下没有可用模型
                </p>
              ) : (
                models.map((m) => (
                  <label
                    key={m}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-note text-ink hover:bg-surface-subtle"
                  >
                    <input
                      type="checkbox"
                      checked={draft.selected.includes(m)}
                      onChange={() => toggleModel(m)}
                      className="h-3.5 w-3.5 accent-[var(--brand-primary)]"
                    />
                    <span className="truncate font-mono">{m}</span>
                  </label>
                ))
              )}
            </div>
          )}
          <p className="mt-1.5 text-meta leading-normal text-ink-muted">
            限定之后，用这把密钥调用其他模型会被拒绝。
          </p>
        </div>

        {/* IP 白名单 —— 官方 token.allow_ips 字段，防盗用最直接的一道 */}
        <Field
          label="IP 白名单"
          htmlFor="key-ips"
          hint="留空表示不限制来源。填写后，只有这些地址可以使用这把密钥。"
        >
          <Textarea
            id="key-ips"
            value={draft.allowIps}
            onChange={(e) => setDraft({ ...draft, allowIps: e.target.value })}
            rows={3}
            placeholder={'一行一个 IP 或网段，例如：\n203.0.113.45\n198.51.100.0/24'}
            className="w-full font-mono text-note"
          />
        </Field>

        {/* 过期时间 —— 之前只能显示不能设，现在可选档位 */}
        <Field
          label="过期时间"
          htmlFor="key-expire"
          hint={
            isEdit
              ? '不改就保持原到期时间。到期后这把密钥自动失效。'
              : '到期后这把密钥自动失效，适合给测试或外包临时使用。'
          }
        >
          <Select
            id="key-expire"
            value={draft.expireDays}
            onChange={(e) => setDraft({ ...draft, expireDays: Number(e.target.value) })}
            className="w-full"
          >
            {/* 编辑时永远先给「保持原到期时间」并默认选中：不主动改档位，日期就不动 */}
            {isEdit && (
              <option value={0}>
                {`保持原到期时间（${
                  draft.originalExpire > 0 ? formatTime(draft.originalExpire) : '永不过期'
                }）`}
              </option>
            )}
            <option value={-1}>永不过期</option>
            <option value={7}>7 天后自动失效</option>
            <option value={30}>30 天后自动失效</option>
            <option value={90}>90 天后自动失效</option>
          </Select>
        </Field>

        {error && (
          <div
            role="alert"
            className="rounded-control border border-danger/25 bg-danger-soft px-3 py-2 text-note text-danger-text"
          >
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
