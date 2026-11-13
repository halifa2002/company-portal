'use client';

import { useState } from 'react';
import { apiBase } from '@/lib/brand';

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
  path: string;
  request: string;
  response: string;
}

const SAMPLES: Record<Tab, Sample> = {
  Chat: {
    path: '/v1/chat/completions',
    request: `curl -X POST "${apiBase}/v1/chat/completions" \\
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
    path: '/v1/responses',
    request: `curl -X POST "${apiBase}/v1/responses" \\
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
    path: '/v1/messages',
    request: `curl -X POST "${apiBase}/v1/messages" \\
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
    path: '/v1beta/models/:model\\:generateContent',
    request: `curl -X POST "${apiBase}/v1beta/models/your-model:generateContent" \\
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
  const sample = SAMPLES[tab];
  const dark = tone === 'dark';

  /*
   * 复制整段请求。
   *
   * 2026-11-13：以前这段代码只能手动框选，全页最高频的动作里它排第一。
   * 剪贴板 API 只在 https / localhost 下可用，内网用 http + IP 打开会直接抛错，
   * 所以退回隐藏 textarea + execCommand；两条都失败也不弹错——代码就在旁边，能手动选。
   */
  const copy = async () => {
    /*
     * 先给反馈，再干活。
     * 剪贴板 API 在没有焦点/没有授权的环境里会一直挂着不 resolve，
     * 先 await 再改状态的话，按钮点下去跟没点一样。内容本来就在旁边，
     * 复制失败也不影响用户手动选。
     */
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);

    try {
      await navigator.clipboard.writeText(sample.request);
    } catch {
      const el = document.createElement('textarea');
      el.value = sample.request;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch {
        /* 复制不了就静默 */
      }
      el.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

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
            onClick={() => setTab(item)}
            className={`relative px-3 pb-2.5 text-note transition-colors ${
              tab === item
                ? dark
                  ? 'font-medium text-white'
                  : 'font-medium text-ink'
                : dark
                  ? 'text-white/45 hover:text-white/75'
                  : 'text-ink-muted hover:text-ink-soft'
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
        <span className={`ml-auto flex items-center gap-1.5 pb-2.5 text-meta ${dark ? 'text-white/40' : 'text-ink-muted'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          200 OK
        </span>
        <button
          type="button"
          onClick={copy}
          className={`mb-2 ml-3 shrink-0 rounded border px-2 py-1 text-meta transition-colors ${
            dark
              ? 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
              : 'border-line text-ink-mid hover:border-ink/30 hover:text-ink'
          }`}
        >
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
        <div className={`mt-2.5 text-meta font-medium uppercase tracking-wider ${dark ? 'text-white/35' : 'text-ink-muted'}`}>
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
        <div className={`text-meta font-medium uppercase tracking-wider ${dark ? 'text-white/35' : 'text-ink-muted'}`}>
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
          dark ? 'border-white/10 bg-white/[0.04] text-white/40' : 'border-line bg-surface-tint-soft text-ink-muted'
        }`}
      >
        <span>示例响应 · 实际以调用结果为准</span>
        <span className="font-mono">STREAM · SSE</span>
      </div>
    </div>
  );
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
