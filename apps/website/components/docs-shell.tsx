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

      {/* 2026-11-16 手机适配：外层宽度必须由父级决定，不能由内容撑开。
       * 不加 [contain:inline-size] 时，移动端顶部导航（ul 是 w-max，885px）、代码块长行、
       * 接口表（min-w-[680px]）会把文档宽度撑到 933px，手机上的正文被切掉一大截。
       * 必须同时加 w-full：contain 会把元素自身的内容尺寸算成 0，父级是 flex 列 + auto 边距时
       * 只靠 contain 会缩成一条竖排窄条（实测 2026-11-16）。
       * 也不能用 max-w-[100vw]：带滚动条的窗口上 100vw 比可视宽度大 15px，会多出横向滚动条。 */}
      <div className="mx-auto w-full max-w-[1600px] px-6 [contain:inline-size] 2xl:px-10">
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
