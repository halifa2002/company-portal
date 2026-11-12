'use client';

import { useState } from 'react';

/**
 * 首页页尾的折叠问答。
 *
 * 为什么单独抽成一个客户端组件：官网整体是静态导出（output: 'export'），
 * 页面本身是服务端组件，展开收起必须有状态，只能在这一小块里 use client，
 * 不能为了一个手风琴把整页降级成客户端组件。
 *
 * 为什么不是 <details>：默认的 <details> 展开时有跳变、箭头位置跟这里的版式对不上，
 * 而且没法做「同一时间只开一条」。用按钮 + aria-expanded 自己控制，语义一样，样式可控。
 */

export type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: ReadonlyArray<FaqItem> }) {
  /*
   * 默认展开第一条：一进来看到答案长什么样，才知道这些行是可以点的。
   * 全部收起会让人以为下面是四条不该点的标题。
   */
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.q} className="border-t border-line last:border-b">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-brand"
              >
                <span className="text-title font-semibold text-ink">{item.q}</span>
                {/*
                  加号转减号：横线常驻，竖线靠 scale-y-0 收掉。
                  比换成两个不同图标省事，也有过渡——直接换字符会「啪」一下跳掉。
                */}
                <span aria-hidden className="relative mt-1.5 h-4 w-4 shrink-0 text-ink-muted">
                  <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                  <span
                    className={`absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-transform duration-200 ${
                      open ? 'scale-y-0' : ''
                    }`}
                  />
                </span>
              </button>
            </h3>

            {open && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="max-w-2xl pb-6 pr-8 text-body leading-relaxed text-ink-mid"
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
