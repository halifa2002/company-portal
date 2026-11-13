'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import { VendorLogo } from './vendor-logo';

/**
 * 首页「模型覆盖」横向卡片带。
 *
 * 两个效果都靠这里：
 * 1) 近大远小——每次滚动后，按「卡片中心到容器中心」的距离算缩放和透明度，
 *    写进 transform 而不是改宽度。transform 不触发重排，19 张卡滚起来也不卡。
 * 2) 拖拽滑动——鼠标按下能拖着走（只拦 pointerType=mouse），触摸交给浏览器原生惯性。
 *
 * 卡片上没有价格：后端倍率还是占位值，写上去就是报假价（文档 4.1）。
 */
export type StripModel = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  /** 上下文长度，目录里没有这一项时为空 */
  context?: string;
};

/**
 * 阶梯尺寸：中间那张 1.0，左右各退一档。
 *
 * 档位是固定的（0.15 一档，最小 0.6），所以「左二」和「右二」必然一样大——
 * 用连续距离算不会有这个性质，中间常常落在两张卡之间，最大的就成了两张。
 */
/*
 * 2026-11-13 第五版：档位从 0.15 收到 0.09。
 * 原来三档就掉到 0.7，一条带里并排放着"大中小"三种盒子，
 * 看着不像景深，像三张没对齐的卡片。压到 0.09 之后第一张只比中间小一档多，
 * 仍然是中间最大，但整条读起来是一条带，不是三个物件。
 */
const SCALE_STEP = 0.09;
const MIN_SCALE = 0.78;
const OPACITY_STEP = 0.02;
const MIN_OPACITY = 0.94;
/** 中间那张往上抬多少 */
const LIFT = 7;
/** 卡宽与卡高。参考站的卡片是大块头，缩得太小字就撑不住 */
const CARD_W = 236;
const CARD_H = 268;
/** 卡与卡之间留的缝（和容器上的 gap-6 一致） */
const GAP = 24;
/** 卡的实际占位 = 卡宽 + gap。缩放的只是视觉，占位始终是它 */
const SLOT = CARD_W + GAP;

/** 一个元素在横轴上的中心点（相对视口），居中判定与位置补偿都用它 */
function centerOf(card: HTMLElement): number {
  const rect = card.getBoundingClientRect();
  return rect.left + rect.width / 2;
}

export function ModelStrip({ models }: { models: StripModel[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  /* ---------- 近大远小（左右对称） ---------- */
  const paint = useCallback(() => {
    const track = trackRef.current;
    const cards = cardRefs.current.filter((card): card is HTMLAnchorElement => card !== null);
    if (!track || cards.length < 2) return;

    /*
     * 分两步：先定「现在哪一格在中间」，再按各卡与它的序号差分档缩放。
     *
     * 别用 offsetLeft 去算——卡的 offsetParent 是页面（带滚动的那层不是定位元素），
     * offsetLeft 是页面坐标；而容器中线是滚动内容坐标，两个坐标系差了 scrollLeft，
     * 结果「中间那张」会整体往左偏几格（最大的一张跑到左边去了）。
     * 这里改用 getBoundingClientRect 的中心：transform: scale 以中心为原点，
     * 缩放前后中心点不变，所以它读到的就是每张卡的槽位中心，跟滚动天然对齐。
     */
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    const centers = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });

    let middle = 0;
    let nearest = Number.POSITIVE_INFINITY;
    centers.forEach((center, index) => {
      const distance = Math.abs(center - trackCenter);
      if (distance < nearest) {
        nearest = distance;
        middle = index;
      }
    });

    /*
     * 只做「近大远小」，不再横向收缝（原因见下面 shift 那段）。
     * 缩小后卡与卡之间的缝会变宽，这是可接受的代价：缝宽看着是留白，
     * 叠在一起看着是排版坏了。
     */

    cards.forEach((card, index) => {
      const distance = Math.abs(index - middle);
      const scale = Math.max(MIN_SCALE, 1 - distance * SCALE_STEP);
      const opacity = Math.max(MIN_OPACITY, 1 - distance * OPACITY_STEP);
      const lift = -LIFT * Math.max(0, 1 - distance);

      /*
       * 2026-11-13（改版第三版）：横向补偿取消，只留缩小 + 上抬。
       *
       * 原来按「视觉宽度」把两侧往中线推，在 1600 宽的容器里看不出来；
       * 换成 1240 的容器后，缩放档位叠加的推移量超过了实际缝隙，
       * 中间那张直接压到邻居身上（截图里两卡边界是重叠的）。
       *
       * 现在布局位置一格不动，只改视觉大小：中间那张仍最大、最靠上，
       * 两侧依次小下去，卡与卡之间永远留着 flex 的 gap。
       * 牺牲一点"景深"，换回"绝不重叠"——排布出错比不够立体严重得多。
       */
      const shift = 0;

      card.style.transform = `translate(${shift.toFixed(1)}px, ${lift.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);
    });
  }, []);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    let initialised = false;

    /*
     * 左右留白 = (容器宽 − 卡宽) / 2。
     *
     * 这样第一张卡在 scrollLeft=0 时就正好落在屏幕中线上——snap-center 才有意义，
     * 「中间那张」也才是真的在中间。不留的话第一张卡贴着左边，
     * 中间永远是两张卡的交界处，左右对称就无从谈起。
     *
     * 第一张卡在 paint 里只补右侧、不补左侧，所以它的布局起点仍正好是 pad，
     * 这条留白公式不用跟着改。
     *
     * 2026-11-13 第五版：上面这条路走不通，改掉。
     * 首尾留白 450px 意味着开场只能落在中间某一张上（上一版落在第 4 张），
     * 左边那张就必然被裁——截图里第一张卡只剩下「epSeek V4 Pro」半行字，
     * 横着切过去，看着像排版坏了。
     *
     * 现在两侧各留 24（跟 .pv-wrap 的边距一致），开场 scrollLeft=0：
     * 第一张卡整整齐齐贴在左边，右边自然溢出。
     * 「中间那张最大」的效果不靠留白，靠 paint() 按容器中线找最近的一张，
     * 滚动时中间那张照样会放大——只是不再为了让第一张居中而牺牲整条的开头。
     */
    const layout = () => {
      const cards = cardRefs.current.filter((card): card is HTMLAnchorElement => card !== null);
      if (cards.length < 2) return;

      track.style.paddingLeft = '24px';
      track.style.paddingRight = '24px';

      if (!initialised) {
        initialised = true;
        // 从第一张开始：第一张永远完整可见，后面依次排开
        track.scrollLeft = 0;
      }

      paint();
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    };

    layout();
    /* 容器宽度变了要重算留白：铺满整屏后 resize 会说变就变 */
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    }, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
    };
  }, [paint]);

  /* ---------- 鼠标拖拽 ---------- */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // 只接鼠标；触摸交给浏览器原生横向滚动，自己接管会丢惯性
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const track = trackRef.current;
    if (!track) return;

    dragRef.current = { active: true, startX: event.clientX, startScroll: track.scrollLeft, moved: 0 };
    track.style.cursor = 'grabbing';

    /*
     * 移动和松手挂在 window 上，不挂元素：
     * 一是鼠标拖出卡片区域还能继续拖，二是不依赖 setPointerCapture
     * （某些环境上它会抛错，一抛拖拽就整个失效）。
     */
    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active) return;
      const delta = moveEvent.clientX - drag.startX;
      drag.moved = Math.max(drag.moved, Math.abs(delta));
      track.scrollLeft = drag.startScroll - delta;
    };

    const onUp = () => {
      dragRef.current.active = false;
      track.style.cursor = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  // 拖完松手会顺带触发 click，会把人甩进某个模型详情页——这里拦掉
  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.moved > 6) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.moved = 0;
    }
  };

  /*
   * 箭头一次走一张卡。
   *
   * 不能写死像素：一格宽 =「卡宽 + 间距」224px，写 520 会落到两格半的位置，
   * 被 snap-center 吸到第二张上，看着就是一次跳两张。
   * 现在每张卡的边距还会随缩放变，格距不再是常数——干脆直接量「中间那卡」与
   * 「它旁边那卡」的中心差，差多少就滚多少。
   */
  const scrollStep = (direction: 1 | -1) => {
    const track = trackRef.current;
    const cards = cardRefs.current.filter((card): card is HTMLAnchorElement => card !== null);
    if (!track || cards.length < 2) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    let middle = 0;
    let nearest = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const distance = Math.abs(centerOf(card) - trackCenter);
      if (distance < nearest) {
        nearest = distance;
        middle = index;
      }
    });

    const target = cards[middle + direction];
    if (!target) return;

    track.scrollBy({ left: centerOf(target) - centerOf(cards[middle]), behavior: 'smooth' });
  };

  /*
   * 「新」角标的判定（仅首页展示用，不动数据模型）。
   *
   * 上架时间后端没给，目录里也没有这一项，所以按「命名里的日期是否为最新」来定：
   * DeepSeek V4.1 Flash 1017 这种带四位月日的，取最大的那一个月日，
   * 命名里带这个日期的几张卡打标。同一代模型的 Pro / Flash 会一起亮，
   * 这符合直觉——用户关心的是「这一批是新的」，不是哪一张卡单独新。
   * 一个日期都解析不出来的数据，就一张标都不打，不瞎猜。
   */
  const latestStamp = (() => {
    let best: string | null = null;
    models.forEach((model) => {
      const match = model.id.match(/(\d{4})(?!.*\d{4})/);
      if (match && (best === null || match[1] > best)) best = match[1];
    });
    return best;
  })();

  return (
    <div>
      {/*
        翻页箭头挪到卡片带右上角（2026-11-13 第四版）。
        原来两个圆按钮吊在卡片下面正中，卡片带一长（19 张卡），
        按钮离最后一张卡隔了半屏，谁也不知道它管的是上面那条。
        现在贴在带的右上角，跟"往哪翻"的方向一致。
      */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollStep(-1)}
          aria-label="往前看"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-[4px] border border-[#e3eaf2] bg-white text-ink-mid transition-colors hover:border-brand/40 hover:text-brand"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollStep(1)}
          aria-label="往后看"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-[4px] border border-[#e3eaf2] bg-white text-ink-mid transition-colors hover:border-brand/40 hover:text-brand"
        >
          →
        </button>
      </div>

      {/*
        滚动容器（2026-11-13 第五版三处改动）
        1. snap-center → snap-start：留白改成两侧各 24 之后，第一张卡不居中，
           mandatory 会把它强行吸到中间、把开场位置顶掉。贴左对齐才是合法吸附点。
        2. scrollPaddingLeft 跟留白同值，第一张左边缘就是吸附位，开场稳定。
        3. 右缘 56px 渐隐：最后一张永远露出一部分，是"还有更多"的提示；
           直接硬件裁断会像排版出错，淡出才是"没说完"。
      */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        className="flex cursor-grab snap-x snap-start select-none items-center gap-6 overflow-x-auto pb-6 pt-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollPaddingLeft: '24px',
          maskImage: 'linear-gradient(to right, #000 0, #000 calc(100% - 56px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, #000 0, #000 calc(100% - 56px), transparent 100%)',
        }}
      >
        {models.map((model, index) => {
          const isNew = latestStamp !== null && model.id.includes(latestStamp);

          return (
            <Link
              key={model.id}
              /*
               * 整块卡片可点，但统一落到模型广场列表页，不进单个模型详情页。
               *
               * 首页这一段的定位是「展示我们有哪些模型」，点它的意图多半是
               * 「去看看还有什么、比较一下」，不是要读某一个模型的详情——
               * 详情页留给在列表页里挑中之后点进去。
               * 卡片如果完全不可点反而别扭：看着像卡、鼠标也悬停得上去，点了没反应。
               */
              href="/models"
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              draggable={false}
              /*
               * 2026-11-13：卡片从淡紫改成白。
               * 这一段整块底色已经是浅靛（#f3f4ff），卡片再用品牌淡紫（#eef2ff）
               * 两者只差两个色阶，边界直接消失，看着"看不清"。现在让背景承担颜色，
               * 卡片回到白面，靠一层极轻的投影把它托起来。
               */
              className="relative flex h-[268px] w-[236px] shrink-0 snap-start flex-col rounded-[6px] border border-[#e3eaf2] bg-[#f9fbfe] p-6 transition-[border-color,background-color,box-shadow,transform] duration-200 will-change-transform hover:-translate-y-0.5 hover:border-[#c9d9e8] hover:bg-white hover:shadow-[0_14px_30px_-22px_rgba(10,37,64,0.45)]"
            >
              {/*
                「新」角标贴在卡片右上角。
                2026-11-13：从纯绿（#0f9d58）改成深海军蓝。
                纯绿只有在深底上才压得住，压在白卡上就是一个电商折扣标签，
                这一段换成暖灰底之后更跳。改成海军蓝，跟页面同一套色。
              */}
              {isNew ? (
                <span className="absolute right-4 top-4 rounded-[4px] bg-[#0b1b2b] px-2 py-0.5 text-[11px] font-medium leading-5 text-white">
                  新
                </span>
              ) : null}

              <VendorLogo vendor={model.vendor} size={32} />

              <h3 className="mt-5 line-clamp-2 text-heading font-medium leading-snug tracking-tight text-ink">
                {model.name}
              </h3>

              {/* 模型 id 用等宽字：开发者真正要填进 model 字段的就是这串 */}
              <p className="mt-2 truncate font-mono text-body leading-relaxed text-ink-muted">
                {model.id}
              </p>

              <p className="mt-1 text-body leading-relaxed text-ink-muted">
                {model.context ? `${model.vendor} · ${model.context} 上下文` : model.vendor}
              </p>

              {/* 分类标签：从蓝灰描边改中性描边，白卡上只剩一道细线，不再抢「模型名」 */}
              <span className="mt-auto inline-flex w-fit rounded-[3px] border border-[#e3eaf2] bg-white px-2 py-0.5 text-meta text-ink-muted">
                {model.category}
              </span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}








