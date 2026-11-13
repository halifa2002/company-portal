import { HomePageBody } from '@/components/preview/home-page-body';
import '../preview.css';

/**
 * 首页「预览版」—— 与正式版完全独立的一份副本。
 *
 * 地址：http://127.0.0.1:4101/preview/home
 *
 * 2026-11-13 第七版：整页按 teamorouter 的结构重排（首屏 / 数字条 / 实时价格 /
 * 平台能力 / 快速开始 / 常见问题），首屏的质感借 fireworks.ai 的顶部
 * （白→浅蓝渐变 + 半调网点 + 胶囊按钮）。
 *
 * 独立性的保证（用户硬要求）：
 *   预览页用到的组件全部在 components/preview/ 下，是正式版的独立副本，
 *   页面骨架、首屏、各段落一个都没有共用。预览样式只走本目录的 preview.css，
 *   全部选择器挂在 .pvw 下，正式页不加载这个文件。
 *
 * 定稿后：把预览目录里的改动搬回 components/ 下的正式文件，再删掉这一页。
 * 不在导航里，也不进 sitemap。
 */
export const metadata = {
  title: '预览版 · 首页',
  robots: { index: false, follow: false },
};

export default function PreviewHomePage() {
  return (
    <div className="pvw">
      <HomePageBody />

      {/*
        左下角一个小标记：这一页是预览版。
        截图发给别人、或者隔一会儿再看，能一眼分清是试验还是线上。
        定稿删这一页时一起删。
      */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-[60] rounded-full bg-[#06223f]/90 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/85 shadow-lg backdrop-blur">
        预览版 · 改这里不影响正式站
      </div>
    </div>
  );
}
