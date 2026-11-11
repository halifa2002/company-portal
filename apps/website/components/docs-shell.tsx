import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { DocsMobileNav, DocsSidebar } from '@/components/docs-nav';

/**
 * 文档页外壳：左侧分组导航 + 正文。
 *
 * 曾经还有顶部一级 tab 和右侧「本页目录」，三栏加一条 tab 挤在一起很乱，
 * 2026-11-11 两样都去掉：导航只留左侧一套，正文限宽 980px 保证一屏一行读得完。
 */
export function DocsShell(props: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />

      <div className="mx-auto max-w-[1600px] px-6 2xl:px-10">
        <div className="flex gap-10 pt-10 pb-8 xl:gap-14">
          <DocsSidebar />

          <article className="min-w-0 max-w-[980px] flex-1">
            <DocsMobileNav />
            {props.children}
          </article>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
