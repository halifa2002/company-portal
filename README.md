# 品牌前端（官网 + 用户控制台）

公司自研的前端界面，独立仓库，与后端仓库（New API 公司维护 Fork）同级。

按技术方案文档 3.2 拆分：前端单独做版本管理，后端跟随官方升级，两边互不干扰。

## 目录

```text
company-portal/
├── apps/
│   ├── website/          品牌官网（:4101）
│   └── console/          用户控制台（:4102）
├── packages/
│   ├── api-client/       对后端接口的统一封装
│   ├── ui/               共用界面零件
│   ├── design-tokens/    品牌色、字号、间距（单一真源）
│   ├── types/            接口数据类型
│   └── pricing/          价格换算
├── deploy/               前端部署配置
├── docs/                 前端文档
└── tests/                前端测试
```

## 常用命令

在仓库根目录执行：

| 做什么 | 命令 |
| --- | --- |
| 装依赖 | `bun install` |
| 起官网（:4101） | `bun run dev:website` |
| 起控制台（:4102） | `bun run dev:console` |
| 构建两个应用 | `bun run build` |
| 类型检查 | `bun --cwd apps/website run typecheck`、`bun --cwd apps/console run typecheck` |
| 单元测试 | `bun --cwd apps/website run test:unit` |

## 边界

- 前端只调后端暴露的 REST 接口，不直接读数据库。
- 管理员后台仍用官方自带的那一套（在后端仓库的 `web/`），这里不重做。
- 后端地址、控制台地址、品牌名都收在各自的 `lib/brand.ts`，换域名只改一处。
