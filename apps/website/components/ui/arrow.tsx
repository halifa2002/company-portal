/**
 * 箭头图标（2026-11-14）
 *
 * 为什么单独一个组件：design-playbook 第 3 条（Hallmark 第 10 条）——
 * 「箭头不要粘在链接文字上」。`开始使用 →` 这种写法里箭头是**文本节点里的一个字符**：
 *   - 位置由字体基线决定，不是设计师摆的，看着永远是「凑」上去的；
 *   - 文字一加 letter-spacing，箭头跟着被推远/推近，间距失控；
 *   - 想让它 hover 时右移 2px 做不到——它和文字是一个整体。
 *
 * 这里把它做成独立的 <span>：间距由父级的 gap（或 className 里的 ml-*）控制，
 * hover 时自己位移，和文字彻底解耦。
 *
 * 用法：父级 Link/button 上必须有 `group`，否则不会动。
 *   <Link className="group inline-flex items-center gap-2 …">
 *     查看文档
 *     <Arrow />
 *   </Link>
 *
 * 正文里的流程箭头（「鉴权与计量 → 路由与重试」）不适用——那是句子的一部分，
 * 本来就该是字符，别套这个组件。
 */
export function Arrow(props: { className?: string }) {
  return (
    <span
      aria-hidden
      className={[
        'inline-block transition-transform duration-150 group-hover:translate-x-0.5',
        'motion-reduce:transition-none motion-reduce:group-hover:translate-x-0',
        props.className ?? '',
      ].join(' ')}
    >
      →
    </span>
  );
}
