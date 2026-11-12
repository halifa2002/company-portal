import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * 不要在这里加 allowedDevOrigins。
   * 2026-11-12 实测：写成 ['127.0.0.1','localhost']（与官网同款）后，控制台 dev
   * 侧边每加载一页就整页重载一次、连成无限刷新；去掉这一项才恢复。
   * 官网仍保留该项，两边配置因此在这一点上刻意不同——改之前先照这个结论验一遍。
   */
  // 工作区包直接引用 TS 源码（main 指向 src/index.ts），需让 Next 一并转译。
  transpilePackages: [
    '@portal/api-client',
    '@portal/types',
    '@portal/pricing',
    '@portal/design-tokens',
    '@portal/ui',
  ],
  // 工作区包在仓库根 node_modules（bun 用 junction 链接），Turbopack 在
  // Windows 上不跟 junction 走，这里直接别名到源码目录。
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
  /**
   * 不规范化末尾斜杠：官方接口有 /api/token/ 这类带尾斜杠的路径。
   * 转发本身由 middleware.ts 完成（不用 rewrites，避免吃掉尾斜杠
   * 导致 Gin 301 回来、形成无限重定向）。
   */
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
