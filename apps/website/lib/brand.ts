/**
 * 品牌常量
 *
 * 品牌名、公司主体、客服邮箱都只在这里维护，页面不各自写死。
 * 2026-11-16：领导已交付公司主体（SNAPPER TRAP INVESTMENTS LIMITED）与客服邮箱。
 */

export const brand = {
  /** 平台名（2026-11-16 定名 TokenFlow，品牌只用英文） */
  name: 'TokenFlow',
  /** 短标识：品牌只用英文名，此处留空；填值才渲染第二行 */
  shortName: '',
  /** 一句话定位（页脚与分享卡共用） */
  tagline: '统一接口，接入主流 AI 模型',
  /** 副标题说明 */
  description:
    '一个 Key 调用多家模型，按量计费，用量透明。为企业与开发者提供稳定的 AI 能力接入。',
  /** 公司主体（法定注册名，原样大写，不翻译不缩写） */
  company: 'SNAPPER TRAP INVESTMENTS LIMITED',
  /*
   * 2026-11-16：站点不在大陆落地，不需要 ICP 备案号，
   * 因此原本的 icp 字段已删除（/about 那条备案行也一并撤掉）。
   * 若将来服务器迁回内地，需要恢复该字段并把备案号显示在页面上。
   */
  /** 客服邮箱 */
  email: 'support@tokenflow365.com',
} as const;

/**
 * 用户控制台地址
 *
 * 2026-11-16：正式域名定为 tokenflow365.com，官网在根域，控制台按子域
 * console.tokenflow365.com 约定。本地开发（next dev）仍指向 localhost:4102，
 * 否则本地点「控制台」会跳到线上；也可以用 NEXT_PUBLIC_CONSOLE_URL 直接覆盖。
 * 若上线改成同域路径（tokenflow365.com/console），只改这一处再加一条反代规则。
 */
const isDev = process.env.NODE_ENV === 'development';

export const consoleBase =
  process.env.NEXT_PUBLIC_CONSOLE_URL ??
  (isDev ? 'http://localhost:4102' : 'https://console.tokenflow365.com');

/**
 * API 网关地址（文档与代码示例里展示的地址）
 *
 * 2026-11-16 定为 api.tokenflow365.com；页面显示时统一在后面加 /v1。
 * 换域名只改这一处。
 */
export const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.tokenflow365.com';

/**
 * 后端仓库地址
 *
 * AGPL-3.0 第 13 条：通过网络提供服务时，必须让用户能拿到「对应源码」。
 * 页脚的「源代码」链接指向上线的具体版本（下面 sourceUrl），仓库必须保持公开。
 */
export const sourceRepo = 'https://github.com/halifa2002/new-api';

/**
 * 线上运行的版本标签（对应后端仓库的 git tag）。
 *
 * 为什么不直接链到仓库首页：仓库默认分支是 main，而开发在 develop，
 * 两边会拉开距离（2026-11-16 实测差 29 个提交），访客点进去看到的是旧代码，
 * 等于「给的源码不对版」。链到 tag 就一步到位。
 *
 * ⚠️ 每次发版改这一行，和发版记录里的版本号保持一致。
 */
export const sourceVersion = 'company-v0.2.0';

/** 页脚「源代码」实际链接：指向该版本目录 */
export const sourceUrl = `${sourceRepo}/tree/${sourceVersion}`;

/** 登录入口 */
export const loginUrl = `${consoleBase}/login`;
/** 注册入口：后端 register_enabled = true，用户可自助注册 */
export const registerUrl = `${consoleBase}/register`;
/** 控制台首页（未登录时控制台自己跳登录） */
export const consoleUrl = consoleBase;

export interface NavItem {
  label: string;
  href: string;
  /** 站外链接（控制台在独立域名/端口），用 <a> 渲染且不参与当前页高亮 */
  external?: boolean;
}

/**
 * 顶部导航。
 *
 * 「首页」放最前：不是所有访客都知道点 logo 能回首页（参考站省掉首页是赌用户习惯，
 * 我们的访客不是天天泡这类站的开发者，这个赌不值得打）。
 * 「控制台」放第二位：紧跟首页，是产品的实际入口，越靠前越容易被点到；
 * 后面的模型广场/价格/文档/生态合作/关于属于内容页。
 */
export const nav: ReadonlyArray<NavItem> = [
  { label: '首页', href: '/' },
  { label: '控制台', href: consoleUrl, external: true },
  { label: '模型广场', href: '/models' },
  { label: '价格', href: '/pricing' },
  { label: '文档', href: '/docs' },
  { label: '生态合作', href: '/partner' },
  { label: '关于', href: '/about' },
];
