/**
 * 文档站的导航骨架。
 *
 * 一条规则：左侧只放「已经写完、点进去有内容」的页面，
 * 不摆占位项——文档站里点开是空的，比没有这一项更伤。
 */
export type DocNavItem = { href: string; label: string };

export const DOC_GROUPS: { title: string; items: DocNavItem[] }[] = [
  {
    title: '开始使用',
    items: [
      { href: '/docs', label: '概览' },
      { href: '/docs/quickstart', label: '快速开始' },
      { href: '/docs/auth', label: 'API Key 与认证' },
      { href: '/docs/protocols', label: '协议选择' },
    ],
  },
  {
    title: '调用参考',
    items: [
      { href: '/docs/chat', label: '文本与对话' },
      { href: '/docs/errors', label: '错误码' },
      { href: '/docs/api', label: '接口速查' },
    ],
  },
  {
    title: '其他',
    items: [
      { href: '/docs/integrations', label: '第三方工具接入' },
      { href: '/docs/faq', label: '常见问题' },
      { href: '/docs/changelog', label: '更新记录' },
    ],
  },
];
