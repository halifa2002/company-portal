'use client';

import { useState } from 'react';
import { apiBase } from '@/lib/brand';

/**
 * 首屏的接口地址条（仅首页预览使用）
 *
 * 参考站把「能直接抄走的地址」摆在第一屏：访客不用翻文档就知道该往哪发请求。
 * 我们原先只有一句「把 base_url 换成平台地址」，地址得自己找。
 *
 * 三个协议共用同一条，切换只改显示——地址都来自 lib/brand 的 apiBase，
 * 上线换域名时不用回来改这里。
 *
 * Claude 与 Gemini 显示的是不带 /v1 的根地址：这两套 SDK 会自己拼
 * /v1/messages 和 /v1beta/models/... 的路径，给它们带 /v1 反而会拼错。
 */
const PROTOCOLS = [
  { key: 'openai', label: 'OpenAI', url: `${apiBase}/v1` },
  { key: 'claude', label: 'Claude', url: apiBase },
  { key: 'gemini', label: 'Gemini', url: apiBase },
] as const;

export function ApiEndpoint() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = PROTOCOLS[active];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.url);
    } catch {
      /*
       * 剪贴板 API 只在 https 或 localhost 下可用。
       * 内网用 http + IP 打开时它直接抛错，退回老办法：造一个隐藏的
       * textarea、选中、execCommand('copy')，再删掉。失败也不弹错误，
       * 地址就在旁边，用户自己也能选。
       */
      const el = document.createElement('textarea');
      el.value = current.url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch {
        /* 复制不了就静默——地址本身是可见可选的 */
      }
      el.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mt-7 flex w-full max-w-[600px] flex-col items-center">
      <div className="flex w-full items-stretch overflow-hidden rounded-full border border-line bg-white/85 shadow-[0_1px_3px_rgba(10,15,30,0.05)] backdrop-blur">
        <div className="flex shrink-0 items-center gap-0.5 py-1.5 pl-1.5 pr-1">
          {PROTOCOLS.map((protocol, index) => (
            <button
              key={protocol.key}
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              className={
                index === active
                  ? 'rounded-full bg-[#12141f] px-3 py-1.5 text-meta font-medium text-white transition-colors'
                  : 'rounded-full px-3 py-1.5 text-meta text-ink-muted transition-colors hover:text-ink'
              }
            >
              {protocol.label}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 border-l border-line py-1.5 pl-4 pr-1.5">
          <code className="truncate font-mono text-note text-ink-mid">{current.url}</code>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-full px-3 py-1.5 text-meta font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      <p className="mt-3 text-meta text-ink-muted">
        换掉地址和 Key 就能跑，接口路径见文档
      </p>
    </div>
  );
}
