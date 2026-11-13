import { HomePageBody } from '@/components/home-page-body';

/**
 * 官网首页。
 *
 * 内容全部在 components/home-page-body.tsx，首屏在 components/hero-next.tsx。
 * 2026-11-13：改造前的旧首页已整段删除；同日试过一版新首屏（v3，拓扑图当主角），
 * 用户判断不好看，已连同预览地址一起撤掉。现在全站只有这一个首页、一套首屏。
 */
export default function HomePage() {
  return <HomePageBody />;
}
