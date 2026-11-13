# 设计手册（虫洞 AI 官网专用）

这个文件夹放的是「改页面前后要对照的规矩」，不是组件库，也不装依赖。

建立于 2026-11-13。起因：官网反复被评价「太空、太素、有 AI 生成感」，
而每次改都从零凭感觉判断，改完也说不清为什么好或不好。
这里把外部成熟的设计守则收进来，翻译成这个站能直接照着做的条目。

## 文件

| 文件 | 是什么 |
| --- | --- |
| `01-hallmark-floor.md` | Hallmark（Together AI）的 16 条「地板规则」原文摘录 + 逐条对照我们站的情况 |
| `02-site-checks.md` | 从上面提炼出的、**这个站每次改完必须自查的 10 条** |
| `03-tools.md` | GitHub 上真正能用上的东西，以及明确不用的 |

## 怎么用

1. 动手前看 `02-site-checks.md`，知道这次要避开什么。
2. 改完按同一份清单自查，不合格不给人看。
3. 想追根究底时回 `01-hallmark-floor.md` 看原始出处。

## 两条前提

- **配色不听外部的**：领导文档 7.1 定死了浅底、深字、蓝做强调。Hallmark 那套「抽主题」的做法不适用，我们只借它的判断标准，不借它的配色。
- **文案一个字不改**：外部守则里关于「重写文案」的部分一律跳过。

## 原始出处

- Hallmark：https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/SKILL.md
- Impeccable：https://github.com/pbakaus/impeccable
- taste-skill：https://github.com/hunger-Eric/taste-skill
