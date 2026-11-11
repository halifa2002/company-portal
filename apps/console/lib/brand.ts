/**
 * 品牌常量（控制台）
 *
 * 与官网 `frontend/apps/website/lib/brand.ts` 的 name 保持一致，
 * 公司定名后两边一起改——此前「智」被写死在三个文件里，改名后只有一处跟上。
 *
 * 这里只放展示用的名字，不放域名与接口地址（那些走环境变量）。
 */
export const brand = {
  /** 平台名 */
  name: '虫洞 AI',
  /** 方形标记里显示的首字（侧边栏、登录页、注册页共用） */
  initial: '虫',
} as const;

/**
 * 官网地址
 *
 * 开发时官网跑在独立端口；上线改子域名时只改这一处（或用环境变量覆盖）。
 * 控制台里指向它的链接一律走**同标签页**跳转：官网上点「控制台」也是同页跳，
 * 两边行为一致；用户要回来按浏览器返回键即可，不会莫名攒出一堆标签页。
 * 真正的站外链接（第三方文档、源码地址）才用新标签页。
 */
export const siteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:4101';

/** 开发者文档 */
export const docsUrl = `${siteUrl}/docs`;

/** 价格页 */
export const pricingUrl = `${siteUrl}/pricing`;
