import type { Metadata } from 'next';
import './globals.css';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  keywords: ['AI API', '大模型接口', 'API 聚合', '按量计费'],
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      {/*
        flex + min-h-svh：内容不足一屏时把页脚顶到视口底部。
        否则页脚下方会露出 body 的白底，像页面没写完（2026-11-16 /docs 发现）。
      */}
      <body className="flex min-h-svh flex-col antialiased">{children}</body>
    </html>
  );
}
