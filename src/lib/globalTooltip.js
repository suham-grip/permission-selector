import { isCoarsePointer } from "./pointer.js";
import { computeTooltipRect } from "./tooltipPosition.js";

let el = null;
let hideTimer = null;

function getEl() {
  if (!el) {
    el = document.createElement('div');
    el.id = 'data-tooltip-root';
    document.body.appendChild(el);
  }
  return el;
}

function show(text, target) {
  clearTimeout(hideTimer);
  const tip = getEl();
  tip.textContent = text;
  tip.style.opacity = '0';
  tip.style.transform = 'none';
  tip.style.display = 'block';
  tip.style.width = 'auto';

  const r = target.getBoundingClientRect();
  const tipW = 220;
  const gap = 6;
  const actualW = Math.min(tip.scrollWidth, tipW);
  const actualH = tip.offsetHeight;

  // 앵커를 가로 중앙에 두고 배치하도록 anchorRect를 실제 너비만큼 좁혀서 넘긴다
  const centeredAnchor = {
    top: r.top,
    bottom: r.bottom,
    left: r.left + r.width / 2 - actualW / 2,
  };
  const { top, left } = computeTooltipRect({
    anchorRect: centeredAnchor,
    bubbleWidth: actualW,
    bubbleHeight: actualH,
    gap,
  });

  tip.style.top = top + 'px';
  tip.style.left = left + 'px';

  requestAnimationFrame(() => { tip.style.opacity = '1'; });
}

function hide() {
  if (!el) return;
  el.style.opacity = '0';
  hideTimer = setTimeout(() => {
    if (el) el.style.display = 'none';
  }, 80);
}

export function initGlobalTooltip() {
  document.addEventListener('mouseover', (e) => {
    if (isCoarsePointer()) return;
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    // 버튼 내부의 svg/path 등 자식 요소 사이를 이동한 경우(relatedTarget이 이미
    // target 안)엔 실제로 hover가 새로 시작된 게 아니므로 무시 — 안 그러면
    // mouseout으로 꺼졌다가 바로 여기서 다시 켜지며 깜빡이는 것처럼 보인다.
    if (e.relatedTarget && target.contains(e.relatedTarget)) return;
    show(target.dataset.tooltip, target);
  });
  document.addEventListener('mouseout', (e) => {
    if (isCoarsePointer()) return;
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    // 나간 곳(relatedTarget)이 여전히 같은 target 내부면(자식 간 이동) 실제로
    // 벗어난 게 아니므로 무시한다.
    if (e.relatedTarget && target.contains(e.relatedTarget)) return;
    hide();
  });
  // capture 단계에서 등록 — 버튼들의 onClick이 e.stopPropagation()을 호출해도
  // (필터 버튼, 카트 제거 버튼 등 다수가 그렇다) capture는 target/bubble 단계보다
  // 먼저 실행되므로 여기서는 항상 클릭을 감지할 수 있다.
  document.addEventListener(
    'click',
    (e) => {
      if (isCoarsePointer()) {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
          show(target.dataset.tooltip, target);
        } else {
          hide();
        }
        return;
      }
      // 마우스: 클릭 시점엔 아직 Preact 리렌더 전이라 data-tooltip이 stale하다.
      // 다음 프레임(리렌더 이후)에 같은 요소가 여전히 남아있고 여전히 hover
      // 중이면(예: 필터 버튼처럼 요소는 유지되고 텍스트만 바뀐 경우) 최신
      // 텍스트로 다시 띄운다. 요소가 사라졌거나(예: 카트에서 항목 제거)
      // 이미 마우스가 벗어났다면 숨긴다.
      const target = e.target.closest('[data-tooltip]');
      requestAnimationFrame(() => {
        if (target && document.body.contains(target) && target.matches(':hover')) {
          const latest = target.dataset.tooltip;
          if (latest != null) {
            show(latest, target);
            return;
          }
        }
        hide();
      });
    },
    true,
  );
}
