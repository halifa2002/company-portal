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
 *
 * 2026-11-13 第四版：外形从「一条细框」改成「两行的控件」。
 * 上一版所有东西都挤在一行里，地址只有 12px，看着像一段说明文字；
 * 现在上半行是协议切换（分段控件），下半行是代码行（浅底 + 左侧箭头），
 * 复制按钮跟着代码行走。它是首屏唯一一个真能用的东西，得看起来能用。
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
    /* 先给反馈再复制：剪贴板 API 在没有焦点的窗口里可能一直挂着，等它就等于按钮没反应 */
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);

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
  };

  return (
    <div className="flex w-full max-w-[600px] flex-col items-center">
      <div
        className="w-full overflow-hidden rounded-[6px] border border-[#dfe8f2] bg-white text-left"
        style={{ boxShadow: '0 10px 30px -22px rgba(6, 34, 63, 0.55)' }}
      >
        {/* 上半行：协议切换 + 复制 */}
        <div className="flex items-center justify-between gap-2 border-b border-[#eef2f7] pl-1.5 pr-1.5">
          <div className="flex items-center gap-0.5" role="tablist" aria-label="接口协议">
            {PROTOCOLS.map((protocol, index) => (
              <button
                key={protocol.key}
                type="button"
                role="tab"
                aria-selected={index === active}
                onClick={() => setActive(index)}
                className={
                  index === active
                    ? 'rounded-[4px] bg-[#f0f6fc] px-2.5 py-2 text-meta font-semibold text-ink transition-colors'
                    : 'rounded-[4px] px-2.5 py-2 text-meta text-ink-muted transition-colors hover:bg-[#f7fafd] hover:text-ink'
                }
              >
                {protocol.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-[4px] px-2.5 py-1.5 text-meta font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>

        {/* 下半行：代码行。浅底 + 左侧箭头，与代码窗里的行同一套语言 */}
        <div className="flex items-center gap-3 bg-[#fafcfe] px-4 py-3">
          <span aria-hidden className="font-mono text-note text-brand">
            ›
          </span>
          <code className="truncate font-mono text-[13.5px] leading-none text-ink">
            {current.url}
          </code>
          <span
            aria-hidden
            className="ml-auto hidden shrink-0 rounded-[3px] border border-[#e3eaf2] px-1.5 py-0.5 font-mono text-[10px] text-ink-muted sm:block"
          >
            POST
          </span>
        </div>
      </div>

      <p className="mt-3 text-meta text-ink-muted">换掉地址和 Key 就能跑，接口路径见文档</p>
    </div>
  );
}
