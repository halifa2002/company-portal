# components/preview/lab —— 预览页专用副本

这里是 `/preview/home` 的**独立副本**，来自 `components/home/`（正式版组件）。

## 为什么有这份副本

2026-11-15 之前，正式页 `app/page.tsx` 和预览页 `app/preview/home/page.tsx` 都
`import '@/components/preview/v9/...'`，看着是预览版，实际改一次两边同时变，
试验田名不副实。这次把正式版组件改名到 `components/home/`，再复制一份到这里，
两边彻底分开。

## 规矩

- **只在这里试新东西**：改 `lab/` 里的文件，只有 `/preview/home` 会变，`/` 不变。
- **发布动作**：满意后把改动搬进 `components/home/`，搬完两边保持一致。
- **不要反向依赖**：`lab/` 可以 import `components/home/` 里没有的东西（如
  `@/lib/brand`、`@portal/*`），但 `components/home/` 绝不能 import 本目录。
- 两边同名组件内容可以不同，这是**预期行为**，不是需要「修掉」的不一致。

## 已知差异

拆分当下（2026-11-15）两份内容完全一致，包括首屏 v9.2 的整行入场与
`.hero-grad-brand` 蓝色渐变。之后的实验差异从这里开始累积。
