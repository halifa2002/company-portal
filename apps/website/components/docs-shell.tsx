import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { DocsSidebar, DocsTabs } from '@/components/docs-nav';

export type DocTocItem = { id: string; label: string };

/**
 * 文档页外壳：顶部一级 tab + 左侧分组导航 + 正文 + 右侧页内目录。
 *
 * 右侧目录是普通锚点链接（静态导出下没有滚动监听），
 * 好处是零 JS、爬虫能读到；代价是不会跟着滚动高亮，这里不做假动画。
 */
export function DocsShell(props: { toc?: DocTocItem[]; children: React.ReactNode }) {
  const toc = props.toc ?? [];

  return (
    <>
      <SiteHeader />

      <div className="mx-auto max-w-[1600px] px-6 2xl:px-10">
        <DocsTabs />

        <div className="flex gap-10 py-8 xl:gap-14">
          <DocsSidebar />

          <article className="min-w-0 flex-1">{props.children}</article>

          {toc.length > 0 && (
            <nav className="hidden w-[180px] shrink-0 xl:block">
              <div className="sticky top-24">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  本页目录
                </div>
                <ul className="mt-2.5 space-y-1.5 border-l border-black/5 pl-3">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-[12.5px] leading-relaxed text-ink-muted transition-colors hover:text-brand"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          )}
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
