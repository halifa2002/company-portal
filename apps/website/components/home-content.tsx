import type { ReactNode } from 'react';

/**
 * 首页共用的内容数据
 *
 * 抽出来的原因：同一份文案要同时喂给「旧版居中格子」和「新版左标题 + 右分条」两套版式，
 * 两份并存期间不能各写一份——改一处忘一处，最后两版说法不一致。
 * 首页两块共用，所以放这里而不是塞在页面文件里。
 */

/** 平台能力：六个点 */
export const capabilities: ReadonlyArray<{ title: string; desc: string; icon: ReactNode }> = [
  {
    title: '主流模型覆盖',
    desc: '通用对话、推理、编程等主流模型统一接入，厂商上新同步跟进。',
    icon: (
      <>
        <path d="M12 3.6 3.8 7.8 12 12l8.2-4.2z" strokeLinejoin="round" />
        <path d="M3.8 12 12 16.2 20.2 12M3.8 16.2 12 20.4l8.2-4.2" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: '统一接口',
    desc: '三种协议共用一套鉴权与请求格式，不用为每个厂商写一套适配。',
    icon: (
      <>
        <path d="M12 3.4 20 7.6v8.8L12 20.6l-8-4.2V7.6z" strokeLinejoin="round" />
        <path d="M12 12 20 7.6M12 12v8.6M12 12 4 7.6" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: '稳定调用',
    desc: '同一模型可配多条上游线路，单条异常时自动重试并切换。',
    icon: (
      <>
        <path d="M4.2 17.4a8 8 0 1 1 15.6 0" strokeLinecap="round" />
        <path d="M12 17.4 15.6 11.6" strokeLinecap="round" />
        <circle cx="12" cy="17.4" r="1.3" />
      </>
    ),
  },
  {
    title: '成本透明',
    desc: '价格、用量、账单在同一处查看，每一笔扣费都能追到具体请求。',
    icon: (
      <>
        <path d="M6 3.6h12v17l-3-2-3 2-3-2-3 2z" strokeLinejoin="round" />
        <path d="M9 8.4h6M9 12.4h4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: '额度可控',
    desc: '每个 Key 独立设额度上限与模型权限，单个应用吃不光整月预算。',
    icon: (
      <>
        <path d="M12 3.2 19 6v5.2c0 4.2-2.9 6.9-7 8.4-4.1-1.5-7-4.2-7-8.4V6z" strokeLinejoin="round" />
        <path d="M9.4 13.4V11m2.6 2.4V9.4m2.6 4V12" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: '接入零改造',
    desc: '换掉 base_url 与密钥即可上线，文档、示例与常见客户端都已就绪。',
    icon: (
      <>
        <path d="M9 8 5 12l4 4M15 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

/** 接入三步 */
export const steps = [
  { no: '01', title: '注册并获取 Key', desc: '登录控制台，在「API 密钥」页新建一个 Key。' },
  { no: '02', title: '替换地址与密钥', desc: '把 base_url 指向本平台，API Key 换成平台密钥。' },
  { no: '03', title: '直接调用', desc: '沿用原有 SDK 与代码，不需要改调用逻辑。' },
];
