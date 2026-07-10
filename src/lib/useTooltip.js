import { useState, useRef, useCallback, useEffect } from "preact/hooks";
import { isCoarsePointer } from "./pointer.js";

// 화면 전체에서 동시에 열려 있을 수 있는 툴팁은 하나뿐이어야 하므로,
// 새로 열리는 툴팁이 이전에 열려 있던 툴팁을 직접 닫아준다.
let activeHide = null;

const LONG_PRESS_MS = 500;

// 롱프레스로 열린 직후 같은 터치가 만들어내는 합성 click을 한 번만 삼킨다.
// document capture 단계에서 가로채므로, 대상 엘리먼트에 걸린 onClick과의
// 리스너 등록 순서와 무관하게(같은 엘리먼트에 ref/onClick이 함께 있어도) 항상 먼저 막을 수 있다.
function suppressNextClick() {
  function handler(e) {
    e.preventDefault();
    e.stopPropagation();
    cleanup();
  }
  function cleanup() {
    document.removeEventListener("click", handler, true);
    clearTimeout(fallbackId);
  }
  document.addEventListener("click", handler, true);
  const fallbackId = setTimeout(cleanup, 1200);
}

// 마우스: hover로 열고 닫음.
// 터치: 꾹 누른 채 약 0.5초(LONG_PRESS_MS) 유지해야 열리고, 열리고 나서 손을 떼면
// 클릭 이벤트 없이 그냥 유지됨(바깥 탭하면 닫힘). 0.5초 전에 손을 떼면 그냥 탭으로 처리.
export function useTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hideTimerRef = useRef(null);
  const longPressTimerRef = useRef(null);

  const hide = useCallback((delay = 0) => {
    clearTimeout(hideTimerRef.current);
    if (delay > 0) {
      hideTimerRef.current = setTimeout(() => setOpen(false), delay);
    } else {
      setOpen(false);
    }
  }, []);

  const show = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    if (activeHide && activeHide !== hide) activeHide();
    activeHide = hide;
    setOpen(true);
  }, [hide]);

  const cancelLongPress = useCallback(() => {
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }, []);

  const startLongPress = useCallback(() => {
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null;
      suppressNextClick();
      show();
    }, LONG_PRESS_MS);
  }, [show]);

  useEffect(() => cancelLongPress, [cancelLongPress]);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    // capture 단계로 등록: 다른 툴팁 트리거를 터치해도(각자 onPointerDown에서
    // stopPropagation을 호출해도) target에 도달하기 전에 먼저 실행되어 반드시 닫힌다.
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [open]);

  const handlers = isCoarsePointer()
    ? {
        onPointerDown: (e) => {
          e.stopPropagation();
          startLongPress();
        },
        onPointerUp: cancelLongPress,
        onPointerCancel: cancelLongPress,
        onPointerLeave: cancelLongPress,
      }
    : {
        onMouseEnter: show,
        onMouseLeave: () => hide(80),
      };

  return {
    open,
    ref,
    handlers,
    show,
    hide,
    longPress: { start: startLongPress, cancel: cancelLongPress },
  };
}
