import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 官网是内容站，走静态导出更稳、更快、能直接上 CDN。
  output: 'export',
  // 开发时用 127.0.0.1 打开也要能跑：Next 16 默认只认 localhost，
  // 从其他主机名访问会拦掉 dev 资源，页面变成「看得见、点不动」（筛选、搜索全失效）。
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: { unoptimized: true },
  // 工作区包由 bun 放在仓库根 node_modules（junction 链接），Turbopack 在
  // Windows 上不跟 junction 走；这里别名到源码目录并让 Next 转译 TS 源码。
  transpilePackages: ['@portal/pricing', '@portal/types', '@portal/design-tokens', '@portal/ui'],
  turbopack: {
    root: '../../',
    resolveAlias: {
      '@portal/api-client': '../../packages/api-client/src/index.ts',
      '@portal/types': '../../packages/types/src/index.ts',
      '@portal/pricing': '../../packages/pricing/src/index.ts',
      '@portal/design-tokens': '../../packages/design-tokens/src/index.ts',
      '@portal/ui': '../../packages/ui/src/index.ts',
    },
  },
};

export default nextConfig;
