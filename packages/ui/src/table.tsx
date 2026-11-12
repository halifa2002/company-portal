import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

/**
 * 表格零件。
 *
 * 为什么不用原生 <table> 直接写：
 *   1. 表头底色、行高、单元格内边距在 6 个列表页各写一套，行高有 40/44/48 三种；
 *   2. 横向滚动容器经常漏写，窄屏上表格把整个页面撑宽，右边内容被切掉看不见。
 * 这里把「白底 + 圆角 + 一档边框 + 横向可滚」固定下来。
 */
export function TableWrap({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-card border border-line bg-surface ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-left">{children}</table>
      </div>
    </div>
  );
}

/**
 * 表头。浅灰底是故意的：七列纯白没有竖线，扫行容易串行。
 * 字号 12、字重 500、颜色比正文浅一档——表头是路牌，不该比内容更响。
 */
export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-line bg-surface-subtle">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({
  children,
  align = 'left',
  className = '',
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-4 py-2.5 text-meta font-medium text-ink-mid ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Tr({
  children,
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-line transition-colors last:border-0 hover:bg-surface-subtle/60 ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  align = 'left',
  className = '',
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' }) {
  return (
    <td
      className={`px-4 py-3 align-middle text-note text-ink ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

/** 单元格内的次要信息（第二行、时间、备注），比主值浅一档、小一档 */
export function TdSub({ children }: { children: ReactNode }) {
  return <span className="block text-meta leading-normal text-ink-muted">{children}</span>;
}
