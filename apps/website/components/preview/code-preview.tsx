'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * API 接入示例卡片 —— md 4.1 首页明确要求「API 接入示例」
 *
 * 四个协议标签对应官方支持的调用方式：
 * OpenAI 兼容（Chat）、Responses、Claude、Gemini。
 * 代码内容与真实调用格式一致，方便开发者直接复制。
 *
 * tone（2026-11-13）：深色整幅段落里嵌这张卡时传 dark。
 * 浅底页面上突然出现一块深色，视线会停下来；卡本身不换结构，只换一套描边与字色。
 */

const TABS = ['Chat', 'Responses', 'Claude', 'Gemini'] as const;
type Tab = (typeof TABS)[number];
type Tone = 'light' | 'dark';

interface Sample {
  file: string;
  path: string;
  request: string;
  response: string;
}

const SAMPLES: Record<Tab, Sample> = {
  Chat: {
    file: 'chat.sh',
    path: '/v1/chat/completions',
    request: `curl -X POST "$BASE_URL/v1/chat/completions" \\
  -H "Authorization: Bearer sk-****" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "your-model",
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "stream": true
  }'`,
    response: `{
  "choices": [{
    "message": { "content": "你好，有什么可以帮你？" }
  }],
  "usage": { "prompt_tokens": 8, "completion_tokens": 19 }
}`,
  },
  Responses: {
    file: 'responses.sh',
    path: '/v1/responses',
    request: `curl -X POST "$BASE_URL/v1/responses" \\
  -H "Authorization: Bearer sk-****" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "your-model",
    "input": "你好"
  }'`,
    response: `{
  "output": [
    { "type": "output_text", "text": "你好，有什么可以帮你？" }
  ],
  "usage": { "total_tokens": 31 }
}`,
  },
  Claude: {
    file: 'claude.sh',
    path: '/v1/messages',
    request: `curl -X POST "$BASE_URL/v1/messages" \\
  -H "x-api-key: sk-****" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "your-model",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'`,
    response: `{
  "content": [{ "type": "text", "text": "你好，有什么可以帮你？" }],
  "usage": { "input_tokens": 9, "output_tokens": 18 }
}`,
  },
  Gemini: {
    file: 'gemini.sh',
    path: '/v1beta/models/:model\\:generateContent',
    request: `curl -X POST "$BASE_URL/v1beta/models/your-model:generateContent" \\
  -H "x-goog-api-key: sk-****" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [{ "text": "你好" }]
    }]
  }'`,
    response: `{
  "candidates": [{
    "content": { "parts": [{ "text": "你好，有什么可以帮你？" }] }
  }],
  "usageMetadata": { "totalTokenCount": 29 }
}`,
  },
};

export function CodePreview({ tone = 'light' }: { tone?: Tone }) {
  const [tab, setTab] = useState<Tab>('Chat');
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sample = SAMPLES[tab];
  const dark = tone === 'dark';

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  /*
   * 复制整段请求。
   * 只复制 request，不含返回——返回是给人看的，不是给人跑的。
   * 拿不到剪贴板就什么都不说，不给「已复制」的假反馈。
   */
  async function copyRequest() {
    const ok = await writeClipboard(sample.request);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      className={
        dark
          ? 'overflow-hidden rounded-panel border border-white/10 bg-[#0a1929] shadow-[0_40px_120px_-50px_rgba(27,90,160,0.75)]'
          : 'overflow-hidden rounded-panel border border-line bg-white shadow-[var(--shadow-panel)]'
      }
    >
      {/* 协议标签 */}
      <div className={`flex items-center gap-1 border-b px-4 pt-3 ${dark ? 'border-white/10' : 'border-line'}`}>
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item);
              setCopied(false);
            }}
            className={`relative px-3 pb-2.5 text-note transition-colors ${
              tab === item
                ? dark
                  ? 'font-medium text-white'
                  : 'font-medium text-ink'
                : dark
                  ? 'text-white/45 hover:text-white/75'
                  : 'text-[#5c7189] hover:text-ink'
            }`}
          >
            {item}
            {tab === item && (
              <span
                className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full ${dark ? 'bg-[#5e96cc]' : 'bg-brand'}`}
              />
            )}
          </button>
        ))}
        <span className={`ml-auto flex items-center gap-1.5 pb-2.5 text-meta ${dark ? 'text-white/40' : 'text-[#5c7189]'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          200 OK
        </span>
      </div>

      {/*
        文件名条 + 复制。
        挂个文件名，这一块看起来就是一个能直接跑的文件，而不是文档里的一页示例；
        复制按钮省掉划选——少划一个引号，就少一次跑不通的调试。
      */}
      <div
        className={`flex items-center justify-between gap-3 border-b px-5 py-1.5 ${
          dark ? 'border-white/10 bg-white/[0.03]' : 'border-line bg-[#f8fbfe]'
        }`}
      >
        <span className={`font-mono text-[11.5px] ${dark ? 'text-white/45' : 'text-[#5c7189]'}`}>{sample.file}</span>
        <button
          type="button"
          onClick={copyRequest}
          aria-label="复制这段请求代码"
          className={`inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-[3px] text-[11px] font-medium transition-colors ${
            dark
              ? 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
              : 'border-line text-ink-mid hover:border-[#c9d9e8] hover:text-brand'
          }`}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            className="h-3 w-3"
            aria-hidden
          >
            <rect x="5.5" y="5.5" width="7" height="8" rx="1.2" />
            <path d="M10.5 3.5H4.7a1 1 0 0 0-1 1v7.3" />
          </svg>
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {/* 请求 */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-meta font-medium ${
              dark ? 'bg-white/10 text-[#c2d9ee]' : 'bg-brand-soft text-brand'
            }`}
          >
            POST
          </span>
          <span className={`truncate font-mono text-meta ${dark ? 'text-white/55' : 'text-ink-mid'}`}>
            {sample.path}
          </span>
        </div>
        <div className={`mt-2.5 text-meta font-medium uppercase tracking-wider ${dark ? 'text-white/35' : 'text-[#5c7189]'}`}>
          Request
        </div>
        <pre
          className={`mt-1.5 overflow-x-auto font-mono text-meta leading-[1.75] ${dark ? 'text-white/85' : 'text-ink'}`}
        >
          <code>{highlight(sample.request, dark)}</code>
        </pre>
      </div>

      {/* 返回 */}
      <div className={`mt-3 border-t px-5 py-4 ${dark ? 'border-white/10' : 'border-line'}`}>
        <div className={`text-meta font-medium uppercase tracking-wider ${dark ? 'text-white/35' : 'text-[#5c7189]'}`}>
          Response
        </div>
        <pre
          className={`mt-1.5 overflow-x-auto font-mono text-meta leading-[1.75] ${dark ? 'text-white/85' : 'text-ink'}`}
        >
          <code>{highlight(sample.response, dark)}</code>
        </pre>
      </div>

      {/* 底部状态条 */}
      <div
        className={`flex items-center justify-between border-t px-5 py-2.5 text-meta ${
          dark ? 'border-white/10 bg-white/[0.04] text-white/40' : 'border-line bg-surface-tint-soft text-[#5c7189]'
        }`}
      >
        <span>示例响应 · 实际以调用结果为准</span>
        <span className="font-mono">STREAM · SSE</span>
      </div>
    </div>
  );
}

/**
 * 写剪贴板：先走标准接口，失败再退回临时 textarea。
 *
 * 为什么留退路：navigator.clipboard 只在安全上下文可用，
 * 本地用局域网 IP 打开（http://192.168.x.x:4101）就是非安全上下文，
 * 标准接口直接抛 NotAllowedError——那样按钮点了没反应，用户以为是坏的。
 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 落到下面的老办法
  }

  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * 极简着色：字符串用中性深灰，命令关键字用品牌靛蓝。
 * 不用绿色——页面整体是靛蓝系，一抹翠绿会跳出来。
 * 不引入高亮库，避免为一个静态示例增加依赖。
 */
function highlight(code: string, dark: boolean): React.ReactNode {
  const lines = code.split('\n');
  return lines.map((line, i) => (
    <span key={i} className="block">
      {line.split(/("[^"]*")/g).map((part, j) => {
        if (!part) return null;
        if (part.startsWith('"') && part.endsWith('"')) {
          return (
            <span key={j} className={dark ? 'text-[#7ccbff]' : 'text-ink-mid'}>
              {part}
            </span>
          );
        }
        if (/^\s*(-H|--header|-d|-X)\b/.test(part) || part === 'curl') {
          return (
            <span key={j} className={dark ? 'text-[#affd1d]' : 'text-brand'}>
              {part}
            </span>
          );
        }
        return <span key={j}>{part}</span>;
      })}
    </span>
  ));
}
