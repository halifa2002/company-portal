'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LANGUAGES, PROTOCOLS, type LanguageId, type ProtocolId } from './tokens';
import { apiBase } from '@/lib/brand';

/**
 * 首屏的 BASE URL 控件（v8 的核心交互，2026-11-14 按 teamorouter 重构）。
 *
 * 为什么这么排：teamorouter 的首屏主角不是标题，是一个**可以立刻复制走的地址**——
 * "BASE URL + 一行代码 + 协议 tab"。它把「这是个什么产品」这个抽象问题，
 * 直接降级成「复制这一行，去用」。我们最独特的资产正好也是这个：
 * 三种协议共用同一套地址。
 *
 * 结构（自上而下）：
 *   1. BASE URL 标签 + 大号地址 + 复制按钮   ← 整块的视觉重心
 *   2. 协议 tab（OpenAI Chat / Responses / Claude / Gemini）
 *   3. 当前协议的端点与鉴权方式
 *   4. 语言切换 + 请求示例 + 复制
 *
 * 地址按协议不变（这正是要讲的事），只有路径变——所以地址区不做协议切换，
 * 只在下方切路径，读者一眼就能看到「地址没变，只是尾巴不同」。
 *
 * 动效保持克制：只做代码区的交叉淡入，不做扫光/循环；尊重 prefers-reduced-motion。
 */
/** 文件名：跟着语言切换，让代码区像真的脚本而不是一段无主文本 */
const FILE_NAMES: Record<LanguageId, string> = {
  curl: 'request.sh',
  python: 'main.py',
  node: 'main.ts',
  go: 'main.go',
};

export function ProtocolTabs({ variant = 'full' }: { variant?: 'full' | 'paths' } = {}) {
  const [protocol, setProtocol] = useState<ProtocolId>(PROTOCOLS[0].id);
  const [lang, setLang] = useState<LanguageId>('curl');
  const [copiedApi, setCopiedApi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const reduced = useReducedMotion();
  const current = PROTOCOLS.find((item) => item.id === protocol) ?? PROTOCOLS[0];
  const snippet = current.snippets[lang];
  const baseUrl = `${apiBase}/v1`;
  // 行号列：复制走的仍是不带行号的原串，这里只给阅读用
  const lineNumbers = Array.from({ length: snippet.split('\n').length }, (_, i) => i + 1).join('\n');

  async function copyText(text: string, which: 'api' | 'code') {
    try {
      await navigator.clipboard.writeText(text);
      if (which === 'api') {
        setCopiedApi(true);
        window.setTimeout(() => setCopiedApi(false), 1600);
      } else {
        setCopiedCode(true);
        window.setTimeout(() => setCopiedCode(false), 1600);
      }
    } catch {
      /* 剪贴板不可用时静默失败，用户仍可手动选中 */
    }
  }

  return (
    <div className="overflow-hidden rounded-none border border-ink/15 bg-white shadow-[0_1px_2px_rgba(6,34,63,0.04)]">
      {/* ---------- 1. BASE URL ----------
       * variant="paths" 时整块跳过：首屏的 AddressBar 已经负责「把地址复制走」，
       * 这里只剩「四条路径、怎么调」的细节，不重复第二次大号地址。 */}
      {variant === 'full' && (
        <div className="px-5 pb-4 pt-5 md:px-6 md:pb-5 md:pt-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-meta font-medium uppercase tracking-[0.18em] text-ink-muted">
              BASE URL
            </span>
            <button
              type="button"
              onClick={() => copyText(baseUrl, 'api')}
              className="rounded-none border border-line px-2.5 py-1 text-meta font-medium text-ink-mid transition-colors hover:border-ink/35 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              {copiedApi ? '已复制' : '复制地址'}
            </button>
          </div>

          <code className="mt-2 block break-all font-mono text-[17px] font-medium leading-snug text-ink md:text-[21px]">
            {baseUrl}
          </code>

          <p className="mt-2 text-meta leading-relaxed text-ink-muted">
            三种协议共用这一行地址。换协议只换下面的路径，域名与鉴权方式不用动。
          </p>
        </div>
      )}

      {/* ---------- 2. 协议 tab ---------- */}
      <div
        role="tablist"
        aria-label="协议切换"
        className="flex flex-wrap items-end gap-1 border-y border-line px-3"
      >
        {PROTOCOLS.map((item) => {
          const selected = item.id === protocol;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setProtocol(item.id)}
              className={[
                'relative px-3.5 py-3 text-note transition-colors duration-200',
                'after:absolute after:inset-x-2.5 after:bottom-0 after:h-[2px] after:origin-left after:bg-ink',
                'after:transition-transform after:duration-300 after:ease-out',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                selected
                  ? 'font-medium text-ink after:scale-x-100'
                  : 'text-ink-mid after:scale-x-0 hover:text-ink',
              ].join(' ')}
            >
              {item.tab}
            </button>
          );
        })}
        <span className="ml-auto hidden pb-3 pr-2 text-meta text-ink-muted sm:block">
          {current.family}
        </span>
      </div>

      {/* ---------- 3. 端点与鉴权 ---------- */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-5 py-3">
        <span className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono text-meta font-semibold text-ink-mid">
          POST
        </span>
        <code className="break-all font-mono text-note text-ink">{current.endpoint}</code>
        <span className="ml-auto font-mono text-meta text-ink-muted">{current.auth}</span>
      </div>

      {/* ---------- 4. 代码（窗口化 + 行号，2026-11-14）----------
       * 参考站的代码区有三件"IDE 感"的东西，我们之前都没有：
       *   ① 一排窗口灯 + 文件名（main.py），让人一眼知道这是什么文件；
       *   ② 左侧行号列，代码才有"可抄的脚本"感；
       *   ③ 复制按钮在标题栏右侧，而不是和语言切换挤在一行。
       * 行号用单独一列渲染（aria-hidden + select-none），复制走的仍是不带行号的原串。
       */}
      <div className="relative">
        {/* 语言切换 */}
        <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-2">
          <div className="flex items-center gap-1">
            {LANGUAGES.map((item) => {
              const selected = item.id === lang;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLang(item.id)}
                  className={[
                    'rounded-none px-2.5 py-1 text-meta font-medium transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500',
                    selected
                      ? 'bg-ink text-white'
                      : 'text-ink-mid hover:bg-surface-subtle hover:text-ink',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <Link
            href="/docs/quickstart"
            className="hidden text-meta text-ink-mid transition-colors hover:text-ink sm:inline-flex sm:items-center sm:gap-1"
          >
            查看 API 文档
            <span aria-hidden>↗</span>
          </Link>
        </div>

        {/* 窗口标题栏：三个灯 + 文件名 + 复制 */}
        <div className="flex items-center gap-2 border-b border-line/70 bg-surface-subtle/60 px-4 py-2">
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
          </span>
          <span className="ml-1 font-mono text-meta text-ink-muted">{FILE_NAMES[lang]}</span>
          <button
            type="button"
            onClick={() => copyText(snippet, 'code')}
            className="ml-auto rounded-none border border-line bg-white px-2.5 py-1 text-meta font-medium text-ink-mid transition-colors hover:border-ink/35 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            {copiedCode ? '已复制' : '复制'}
          </button>
          <span aria-live="polite" className="sr-only">
            {copiedCode ? '代码已复制到剪贴板' : copiedApi ? '地址已复制到剪贴板' : ''}
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${protocol}-${lang}`}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex max-h-[320px] overflow-auto"
          >
            <pre
              aria-hidden
              className="select-none border-r border-line/60 py-4 pl-4 pr-3 text-right font-mono text-[12.5px] leading-relaxed text-ink-muted/55"
            >
              {lineNumbers}
            </pre>
            <pre className="flex-1 py-4 pl-4 pr-5 font-mono text-[12.5px] leading-relaxed text-ink-soft">
              <code>{snippet}</code>
            </pre>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


