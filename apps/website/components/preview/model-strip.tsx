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
const SCALE_STEP = 0.15;
const MIN_SCALE = 0.6;
const OPACITY_STEP = 0.02;
const MIN_OPACITY = 0.94;
/** 中间那张往上抬多少 */
const LIFT = 10;
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
     * 两件事一起做：近大远小 + 把缩小留下的大缝收回来。
     *
     * 缝的问题：只缩 transform 的话，卡的占位仍是 208，缩得越小缝越宽，
     * 两侧能裂到 78px；参考站那条带是均匀的 20 上下。
     *
     * 补法一开始用的是负边距（改布局），结果滚动中每换一档布局就整体位移，
     * 滚动位置被越推越远（实测 536 一路窜到 1376）。
     * 改成整条带只用 transform 走位：卡的实际占位一格都不动，
     * 每张卡按「视觉宽度应该落在哪」横向平移。布局不动，滚动就不会被反推。
     */
    const baseWidth = cards[0].offsetWidth;
    const visualWidths = cards.map((_, index) =>
      Math.max(MIN_SCALE, 1 - Math.abs(index - middle) * SCALE_STEP) * baseWidth,
    );

    /* 视觉上相邻两卡的中心距 = 两张卡视觉宽度的一半 + 缝；缝沿用 flex gap 的量 */
    const visualGap = GAP;

    cards.forEach((card, index) => {
      const distance = Math.abs(index - middle);
      const scale = Math.max(MIN_SCALE, 1 - distance * SCALE_STEP);
      const opacity = Math.max(MIN_OPACITY, 1 - distance * OPACITY_STEP);
      const lift = -LIFT * Math.max(0, 1 - distance);

      /*
       * 中间那张不动，两侧逐张往中线靠。
       * 布局上相邻两卡的中心差固定是 SLOT（224），但视觉上缩小后应该只有
       * (两张视觉宽度的一半 + 缝)。两者的差逐张累加，就是要平移的量：
       * 右边的往左挪、左边的往右挪。
       */
      let shift = 0;
      if (index > middle) {
        for (let step = middle; step < index; step += 1) {
          shift += (visualWidths[step] + visualWidths[step + 1]) / 2 + visualGap - SLOT;
        }
      } else if (index < middle) {
        for (let step = index; step < middle; step += 1) {
          shift -= (visualWidths[step] + visualWidths[step + 1]) / 2 + visualGap - SLOT;
        }
      }

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
     */
    const layout = () => {
      const cards = cardRefs.current.filter((card): card is HTMLAnchorElement => card !== null);
      if (cards.length < 2) return;

      const cardWidth = cards[0].offsetWidth;
      const pad = Math.max(8, (track.clientWidth - cardWidth) / 2);
      track.style.paddingLeft = `${pad}px`;
      track.style.paddingRight = `${pad}px`;

      if (!initialised) {
        initialised = true;
        // 落到第 4 张上开场：左边留三张、右边留一串，两边都有料，也不露出左侧留白
        const step = cards[1].offsetLeft - cards[0].offsetLeft;
        const max = track.scrollWidth - track.clientWidth;
        track.scrollLeft = Math.min(3 * step, max);
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
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        className="flex cursor-grab snap-x snap-mandatory select-none items-center gap-6 overflow-x-auto py-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
              className="relative flex h-[268px] w-[236px] shrink-0 snap-center flex-col rounded-panel bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_28px_-16px_rgba(49,46,129,0.35)] transition-[box-shadow] duration-200 will-change-transform hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_18px_40px_-18px_rgba(49,46,129,0.45)]"
            >
              {/*
                「新」角标贴在卡片右上角。
                用品牌绿而不是参考站那种荧光绿——首页主色是靛蓝，
                再插一个高饱和的绿会跳出来抢注意力。
              */}
              {isNew ? (
                <span className="absolute right-4 top-4 rounded-full bg-[#0f9d58] px-2 py-0.5 text-[11px] font-medium leading-5 text-white">
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

              <span className="mt-auto inline-flex w-fit rounded-full border border-line bg-white/70 px-3 py-1.5 text-body text-ink-mid">
                {model.category}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-1 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => scrollStep(-1)}
          aria-label="往前看"
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-mid transition-colors hover:border-brand/40 hover:text-brand"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollStep(1)}
          aria-label="往后看"
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-mid transition-colors hover:border-brand/40 hover:text-brand"
        >
          →
        </button>
      </div>
    </div>
  );
}








