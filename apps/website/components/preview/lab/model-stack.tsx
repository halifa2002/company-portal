import Link from 'next/link';
import { VendorLogo } from '../vendor-logo';
import { Arrow } from '@/components/ui/arrow';

/**
 * 模型图标堆叠胶囊（2026-11-14 加）
 *
 * 参考站价格区有个小控件：一摞叠着的模型图标 + 一句「查看全部模型价格」，
 * 比一个纯文字链接更"有人味"——它用**真实的厂商图标**暗示"我们接了多少家"，
 * 而且成本极低（不需要新素材，图标池 `vendor-logo` 里已经有）。
 *
 * 动效只做一件事：hover 时图标依次散开（每个延迟 30ms），松手再叠回去。
 * 不做无限滚动/波动，那种才叫"AI 味"；`prefers-reduced-motion` 下整体不动。
 */

export function ModelStack(props: {
  /** 厂商名列表（去重后传进来），最多用前 8 个 */
  vendors: string[];
  label: string;
  href: string;
}) {
  const shown = props.vendors.slice(0, 8);

  return (
    <Link
      href={props.href}
      className="group inline-flex items-center gap-3 rounded-full border border-line bg-white py-1.5 pl-2 pr-4 transition-colors hover:border-ink/30 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <span className="flex items-center">
        {shown.map((vendor, index) => (
          <span
            key={vendor}
            className="-ml-2 inline-flex rounded-[6px] ring-2 ring-white transition-all duration-300 ease-out first:ml-0 group-hover:ml-0 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:ml-[-0.5rem]"
            style={{ transitionDelay: `${index * 30}ms`, zIndex: shown.length - index }}
          >
            <VendorLogo vendor={vendor} size={26} />
          </span>
        ))}
      </span>

      <span className="whitespace-nowrap text-note font-medium text-ink">{props.label}</span>
      <Arrow className="text-ink-muted duration-300" />
    </Link>
  );
}
