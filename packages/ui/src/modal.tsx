'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Button, type ButtonVariant } from './button';

/**
 * 弹窗。
 *
 * 为什么自绘而不用浏览器原生 confirm / alert：
 * 原生弹窗长得跟页面完全不是一套——灰底系统字体、按钮顺序跟着操作系统走，
 * 品牌产品里弹一次就露一次破绽；而且只能放一行字，说不清「删了之后谁受影响」。
 * 现在删除类操作都在弹窗里写清后果。
 *
 * 无障碍：
 *   · Esc 关闭（正在提交时不给关，否则用户以为取消了、其实请求已经发出去）
 *   · 打开时焦点移到弹窗上，关闭后还回原来那个按钮
 *   · 打开期间锁住背后页面的滚动
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
  /** 正在提交：禁止 Esc 和点遮罩关闭 */
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
  busy?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  /**
   * 回调放进 ref。
   *
   * 这些回调（尤其 onClose）在调用方几乎都是内联箭头函数，
   * 每次父组件重渲染都是新身份。如果直接写进依赖数组，
   * effect 就会在「每敲一个字」时重新执行一遍：
   * 清理阶段先把焦点还给弹窗外面那个按钮，重新进入时又把焦点交给面板，
   * 于是焦点落在面板 div 上、而不是用户正在打字的输入框——
   * 表现就是打一个字焦点就跑了，中文输入法根本组不出词。
   * 凡是 effect 里用到、但不该触发重建的东西，一律走 ref。
   */
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  onCloseRef.current = onClose;
  busyRef.current = busy;

  // 依赖只有 open：这个 effect 只负责「打开时进入、关闭时退出」，
  // 跟内容怎么变无关。
  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busyRef.current) {
        event.stopPropagation();
        onCloseRef.current();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 延后一拍：等弹窗挂上去再抢焦点，否则抢不到。
    // 但里面有输入框时（比如「名称」），焦点应该落在输入框上而不是面板本身——
    // 弹窗打开就能直接打字，少一次点击。没有输入框的确认框则落在面板上，
    // 不用 Tab 一个来回才发现自己进了弹窗。
    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      if (panel.contains(document.activeElement)) return;
      const field = panel.querySelector<HTMLElement>(
        'input:not([type="radio"]):not([type="checkbox"]):not([disabled]), textarea, select',
      );
      (field ?? panel).focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer);
      // 焦点还给触发它的那个按钮，键盘用户才不用从头 Tab 一遍。
      // 只在这一刻焦点还在弹窗里（或已经掉回 body）时才还：
      // 如果用户已经把焦点挪到别处，就不要再抢一次。
      const active = document.activeElement;
      const stillInside = !active || active === document.body || panelRef.current?.contains(active);
      if (stillInside) returnFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const maxWidth =
    width === 'sm' ? 'max-w-sm' : width === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/25 p-4 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        // 只有点「遮罩本身」才关；从弹窗内部拖选到外面松手不算
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`my-auto max-h-[calc(100dvh-3rem)] w-full overflow-y-auto ${maxWidth} rounded-panel border border-line bg-surface shadow-xl outline-none`}
      >
        <div className="px-6 pb-2 pt-5">
          <h2 className="text-heading font-semibold text-ink">{title}</h2>
          {description && (
            <p className="mt-1.5 text-note leading-normal text-ink-muted">{description}</p>
          )}
        </div>

        {children && <div className="px-6 py-3">{children}</div>}

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 二次确认弹窗。
 *
 * md 只要求「删除有二次确认」，但确认框得说清后果：
 * 「确定删除？」和「删除后，正在用这把密钥的 3 个应用会立刻报错」是两种信息量。
 * danger 语气的确认按钮放在右边、默认不带焦点，避免手快回车就把东西删了。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  detail,
  confirmLabel = '确认',
  cancelLabel = '取消',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** 后果清单，逐条列出来 */
  detail?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ButtonVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      busy={loading}
      width="sm"
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {detail && (
        <div className="rounded-control bg-surface-subtle px-3 py-2.5 text-note leading-relaxed text-ink-mid">
          {detail}
        </div>
      )}
    </Modal>
  );
}
