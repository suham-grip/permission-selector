import { useState, useLayoutEffect } from "preact/hooks";

// 앵커 기준 위/아래 중 공간이 넉넉한 쪽에 배치하고, 좌우·상하 모두
// 뷰포트 밖으로 나가지 않도록 clamp한다. bubbleWidth/Height는 실제 렌더된
// 말풍선 크기(측정값)를 넘겨야 좁은 화면에서도 정확하게 들어맞는다.
export function computeTooltipRect({
  anchorRect,
  bubbleWidth,
  bubbleHeight,
  gap = 7,
  margin = 8,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
}) {
  const spaceAbove = anchorRect.top;
  const spaceBelow = viewportHeight - anchorRect.bottom;
  const below = spaceBelow >= bubbleHeight + gap || spaceBelow >= spaceAbove;

  let top = below
    ? anchorRect.bottom + gap
    : anchorRect.top - gap - bubbleHeight;
  top = Math.max(margin, Math.min(top, viewportHeight - bubbleHeight - margin));

  let left = anchorRect.left;
  left = Math.max(margin, Math.min(left, viewportWidth - bubbleWidth - margin));

  return { top, left, below };
}

// open된 직후엔 말풍선이 아직 DOM에 없어 실제 크기를 모르므로, 우선 숨긴 채
// fallback 크기로 마운트한 뒤 실측(offsetWidth/Height)해 재배치한다.
// useLayoutEffect라 두 번째 계산도 페인트 전에 끝나 깜빡임이 없다.
export function useTooltipPosition(open, anchorRef, bubbleRef, opts = {}) {
  const { fallbackWidth = 220, fallbackHeight = 60, ...rest } = opts;
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const bubbleWidth = bubbleRef.current?.offsetWidth || fallbackWidth;
    const bubbleHeight = bubbleRef.current?.offsetHeight || fallbackHeight;
    setPos(computeTooltipRect({ anchorRect, bubbleWidth, bubbleHeight, ...rest }));
  }, [open]);

  return pos;
}

// 앵커 오른쪽에 붙는(ShortcutChip 등) 패널형 툴팁: 오른쪽 공간이 부족하면
// 왼쪽으로 뒤집고, 상하좌우 모두 뷰포트 안으로 clamp한다.
export function computeSidePanelRect({
  anchorRect,
  panelWidth,
  panelHeight,
  gap = 6,
  margin = 8,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
}) {
  let left = anchorRect.right + gap;
  if (left + panelWidth > viewportWidth - margin) {
    left = anchorRect.left - panelWidth - gap;
  }
  left = Math.max(margin, Math.min(left, viewportWidth - panelWidth - margin));

  let top = anchorRect.bottom + gap;
  top = Math.max(margin, Math.min(top, viewportHeight - panelHeight - margin));

  return { top, left };
}

export function useSidePanelPosition(open, anchorRef, panelRef, opts = {}) {
  const { fallbackWidth = 220, fallbackHeight = 120, ...rest } = opts;
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const panelWidth = panelRef.current?.offsetWidth || fallbackWidth;
    const panelHeight = panelRef.current?.offsetHeight || fallbackHeight;
    setPos(computeSidePanelRect({ anchorRect, panelWidth, panelHeight, ...rest }));
  }, [open]);

  return pos;
}
