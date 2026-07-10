import { useState, useEffect, useRef } from "preact/hooks";

const STORAGE_KEY = "tour_v1_done";
const PAD = 10;
const MOBILE_ANCHOR_GAP = 12;

// --- 복사 전 확인 모달 다이어그램 ---
function CopyModalDiagram() {
  const WARN = "#ca8a04",
    WARN_SOFT = "#fefce8";
  const DANGER = "#dc2626",
    DANGER_SOFT = "#fef2f2";
  const TEXT = "#18181b",
    MUTED = "#71717a",
    BORDER = "#ebebe8";
  const BRAND = "#ff3c78";
  const MX = 16,
    MY = 8,
    MW = 340,
    MH = 222;
  const NX = MX + 16,
    NW = MW - 32;

  const notices = [
    {
      tone: "warn",
      title: "상세 권한 미선택 경고",
      desc: "상세 권한을 고르지 않으면 복사 전 경고가 표시돼요.",
    },
    {
      tone: "warn",
      title: "메뉴 없이 선택된 상세 권한",
      desc: "연결된 메뉴가 없으면 경고가 표시돼요.",
    },
    {
      tone: "danger",
      title: "결재 필요 권한 포함",
      desc: "결재가 필요한 권한이 포함되면 별도로 안내돼요.",
    },
  ];

  return (
    <svg
      viewBox="0 0 372 234"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%" }}
    >
      <rect width="372" height="234" fill="#f4f4f5" />
      {/* shadow */}
      <rect
        x={MX + 2}
        y={MY + 3}
        width={MW}
        height={MH}
        rx="8"
        fill="rgba(0,0,0,0.06)"
      />
      {/* modal */}
      <rect
        x={MX}
        y={MY}
        width={MW}
        height={MH}
        rx="8"
        fill="white"
        stroke={BORDER}
        stroke-width="1"
      />
      {/* header */}
      <text
        x={NX}
        y={MY + 22}
        font-size="11"
        font-weight="700"
        fill={TEXT}
        font-family="sans-serif"
      >
        복사 전 확인
      </text>
      <text
        x={NX}
        y={MY + 38}
        font-size="8"
        fill={MUTED}
        font-family="sans-serif"
      >
        아래 내용을 확인 후 복사를 진행해주세요.
      </text>
      <line
        x1={MX}
        y1={MY + 48}
        x2={MX + MW}
        y2={MY + 48}
        stroke={BORDER}
        stroke-width="1"
      />

      {notices.map((n, i) => {
        const NY = MY + 54 + i * 52;
        const isWarn = n.tone === "warn";
        const C = isWarn ? WARN : DANGER;
        const S = isWarn ? WARN_SOFT : DANGER_SOFT;
        const ICX = NX + 3 + 14,
          ICY = NY + 22;
        return (
          <g key={i}>
            <rect x={NX} y={NY} width={NW} height={44} rx="3" fill={S} />
            <rect x={NX} y={NY} width={3} height={44} rx="1" fill={C} />
            {isWarn ? (
              <circle
                cx={ICX}
                cy={ICY}
                r="8"
                fill="none"
                stroke={C}
                stroke-width="1.5"
                stroke-dasharray="3 2"
              />
            ) : (
              <g>
                <rect
                  x={ICX - 7}
                  y={ICY - 3}
                  width="14"
                  height="10"
                  rx="2"
                  fill="none"
                  stroke={C}
                  stroke-width="1.5"
                />
                <path
                  d={`M${ICX - 4},${ICY - 3} V${ICY - 7} a4,4 0 0,1 8,0 V${ICY - 3}`}
                  fill="none"
                  stroke={C}
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </g>
            )}
            <text
              x={NX + 34}
              y={NY + 16}
              font-size="8.5"
              font-weight="700"
              fill={C}
              font-family="sans-serif"
            >
              {n.title}
            </text>
            <text
              x={NX + 34}
              y={NY + 32}
              font-size="7.5"
              fill={MUTED}
              font-family="sans-serif"
            >
              {n.desc}
            </text>
          </g>
        );
      })}

      {/* footer */}
      <line
        x1={MX}
        y1={MY + MH - 28}
        x2={MX + MW}
        y2={MY + MH - 28}
        stroke={BORDER}
        stroke-width="1"
      />
      <rect
        x={NX}
        y={MY + MH - 22}
        width="96"
        height="16"
        rx="4"
        fill={BRAND}
      />
      <text
        x={NX + 48}
        y={MY + MH - 11}
        font-size="7.5"
        font-weight="600"
        fill="white"
        text-anchor="middle"
        font-family="sans-serif"
      >
        알겠습니다, 복사
      </text>
      <rect
        x={NX + 104}
        y={MY + MH - 22}
        width="36"
        height="16"
        rx="4"
        fill="none"
        stroke={BORDER}
        stroke-width="1"
      />
      <text
        x={NX + 122}
        y={MY + MH - 11}
        font-size="7.5"
        fill={MUTED}
        text-anchor="middle"
        font-family="sans-serif"
      >
        취소
      </text>
    </svg>
  );
}

// --- 관리자 사이드바 다이어그램 ---

// --- 레이아웃 다이어그램 ---
function LayoutDiagram() {
  return (
    <svg
      viewBox="0 0 440 150"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%" }}
    >
      <rect width="440" height="150" fill="#fafafa" />

      {/* 패널 1 */}
      <rect
        x="10"
        y="10"
        width="130"
        height="130"
        rx="6"
        fill="white"
        stroke="#ebebe8"
        stroke-width="1.5"
      />
      <text
        x="75"
        y="30"
        text-anchor="middle"
        font-size="10"
        font-weight="700"
        fill="#18181b"
      >
        권한 메뉴
      </text>
      <line
        x1="10"
        y1="36"
        x2="140"
        y2="36"
        stroke="#ebebe8"
        stroke-width="1"
      />
      <rect x="22" y="44" width="7" height="7" rx="1.5" fill="#ebebe8" />
      <rect x="34" y="45" width="50" height="5" rx="2" fill="#d4d4d8" />
      <rect x="30" y="58" width="7" height="7" rx="1.5" fill="var(--brand)" />
      <rect x="42" y="59" width="40" height="5" rx="2" fill="#d4d4d8" />
      <rect x="30" y="72" width="7" height="7" rx="1.5" fill="#ebebe8" />
      <rect x="42" y="73" width="45" height="5" rx="2" fill="#d4d4d8" />
      <rect x="30" y="86" width="7" height="7" rx="1.5" fill="#ebebe8" />
      <rect x="42" y="87" width="38" height="5" rx="2" fill="#d4d4d8" />
      <rect
        x="105"
        y="57"
        width="25"
        height="13"
        rx="4"
        fill="var(--brand-soft)"
      />
      <text
        x="117.5"
        y="67"
        text-anchor="middle"
        font-size="8"
        fill="var(--brand)"
        font-weight="600"
      >
        1/3
      </text>

      <path
        d="M148 75 L162 75"
        stroke="#d4d4d8"
        stroke-width="1.5"
        marker-end="url(#arr)"
      />

      {/* 패널 2 */}
      <rect
        x="165"
        y="10"
        width="110"
        height="130"
        rx="6"
        fill="white"
        stroke="#ebebe8"
        stroke-width="1.5"
      />
      <text
        x="220"
        y="30"
        text-anchor="middle"
        font-size="10"
        font-weight="700"
        fill="#18181b"
      >
        상세 권한
      </text>
      <line
        x1="165"
        y1="36"
        x2="275"
        y2="36"
        stroke="#ebebe8"
        stroke-width="1"
      />
      <rect
        x="175"
        y="44"
        width="90"
        height="20"
        rx="4"
        fill="var(--brand-soft)"
        stroke="var(--brand)"
        stroke-width="1"
      />
      <rect x="180" y="50" width="7" height="7" rx="1.5" fill="var(--brand)" />
      <rect
        x="192"
        y="51"
        width="40"
        height="5"
        rx="2"
        fill="var(--brand)"
        opacity="0.5"
      />
      <rect
        x="175"
        y="70"
        width="90"
        height="20"
        rx="4"
        fill="#fafafa"
        stroke="#ebebe8"
        stroke-width="1"
      />
      <rect x="180" y="76" width="7" height="7" rx="1.5" fill="#ebebe8" />
      <rect x="192" y="77" width="50" height="5" rx="2" fill="#d4d4d8" />
      <rect x="236" y="76" width="24" height="10" rx="3" fill="#fef2f2" />
      <text
        x="248"
        y="84"
        text-anchor="middle"
        font-size="7"
        fill="#dc2626"
        font-weight="600"
      >
        결재
      </text>
      <rect
        x="175"
        y="96"
        width="90"
        height="20"
        rx="4"
        fill="#fafafa"
        stroke="#ebebe8"
        stroke-width="1"
      />
      <rect x="180" y="102" width="7" height="7" rx="1.5" fill="#ebebe8" />
      <rect x="192" y="103" width="35" height="5" rx="2" fill="#d4d4d8" />

      <path
        d="M283 75 L297 75"
        stroke="#d4d4d8"
        stroke-width="1.5"
        marker-end="url(#arr)"
      />

      {/* 패널 3 */}
      <rect
        x="300"
        y="10"
        width="130"
        height="130"
        rx="6"
        fill="white"
        stroke="#ebebe8"
        stroke-width="1.5"
      />
      <text
        x="365"
        y="30"
        text-anchor="middle"
        font-size="10"
        font-weight="700"
        fill="#18181b"
      >
        선택 현황
      </text>
      <line
        x1="300"
        y1="36"
        x2="430"
        y2="36"
        stroke="#ebebe8"
        stroke-width="1"
      />
      <text x="312" y="53" font-size="9" fill="#18181b">
        ✓
      </text>
      <rect x="323" y="46" width="55" height="5" rx="2" fill="#d4d4d8" />
      <rect x="323" y="57" width="40" height="4" rx="2" fill="#ebebe8" />
      <rect x="323" y="67" width="45" height="4" rx="2" fill="#ebebe8" />
      <text x="312" y="82" font-size="9" fill="#18181b">
        ✓
      </text>
      <rect x="323" y="76" width="60" height="5" rx="2" fill="#d4d4d8" />
      <rect x="323" y="87" width="50" height="4" rx="2" fill="#ebebe8" />
      <rect
        x="310"
        y="122"
        width="110"
        height="12"
        rx="4"
        fill="var(--brand)"
      />
      <text
        x="365"
        y="131"
        text-anchor="middle"
        font-size="8"
        fill="white"
        font-weight="600"
      >
        클립보드 복사
      </text>

      <defs>
        <marker
          id="arr"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0 0 L6 3 L0 6 Z" fill="#d4d4d8" />
        </marker>
      </defs>
    </svg>
  );
}

// --- 스텝 정의 ---
const STEPS = [
  {
    id: "overview",
    targetSelector: null,
    title: "이용 가이드",
    desc: "필요한 권한 메뉴와 상세 권한을 선택하면\n클립보드 복사용 텍스트를 만들어드려요.\n아래 가이드를 따라 직접 사용해봐요.",
    Diagram: LayoutDiagram,
    terms: null,
    advanceOn: null,
    instruction: null,
  },
  {
    id: "menu",
    targetSelector: ".col-menu",
    highlightSelector: ".tree-node-check",
    title: "① 권한 메뉴 선택",
    desc: "체크 박스를 클릭하면 선택돼요.\n선택하면 가운데 패널에 해당 메뉴의 상세 권한이 자동으로 필터링돼요.",
    Diagram: null,
    terms: null,
    advanceOn: {
      type: "click",
      selector: ".tree-node",
      container: ".col-menu",
      capture: true,
      requireChild: ".tree-node-check",
      excludeSelector: ".tree-node-chip-wrap, .perm-filter-btn",
    },
    instruction: "메뉴의 체크박스를 클릭해보세요",
  },
  {
    id: "perm",
    targetSelector: ".col-perm",
    highlightSelector: ".perm-card",
    title: "② 상세 권한 선택",
    desc: "권한 카드를 클릭해 허용할 기능을 선택해요.",
    Diagram: null,
    terms: [
      {
        Chip: "보안",
        label: "결재 필요 권한",
        desc: "보안 담당자의 결재가 필요한 권한이에요.\n해당 권한 선택 시 복사 전 별도로 안내해줘요.",
      },
    ],
    advanceOn: {
      type: "click",
      selector: ".perm-card",
      container: ".col-perm",
      capture: true,
      excludeSelector: ".perm-filter-btn",
    },
    instruction: "권한 카드를 클릭해보세요",
  },
  {
    id: "copy",
    targetSelector: ".col-cart, .mobile-cart-overlay-body",
    highlightSelector: ".cart-copy-btn",
    // 모바일: 선택 현황이 플로팅 버튼 뒤에 숨어있어, 먼저 그 버튼을 직접 눌러
    // 열게 한 뒤에야 복사 버튼 안내로 넘어감 (자동으로 열어주지 않음)
    mobileGateSelector: ".mobile-cart-fab",
    mobileGateInstruction: "선택 현황 보기 버튼을 눌러보세요",
    // 모바일: 화면 상/하단 가장자리가 아니라 안내 대상 버튼(플로팅 버튼 →
    // 복사 버튼) 바로 위에 카드를 붙여, 버튼과 카드가 시각적으로 이어지게 한다
    mobileAnchorAboveTarget: true,
    title: "③ 확인 후 복사",
    desc: "선택한 메뉴와 권한이 오른쪽 패널에 정리돼요.\n확인 후 복사 버튼을 눌러 결재 시스템에 붙여넣으세요.",
    // 모바일은 카드가 선택 현황 패널 바로 위/아래에 붙어 겹치므로, 카드를
    // 최대한 슬림하게 유지해 아래 목록이 가려지지 않게 한다 (다이어그램은 아예 생략).
    mobileDesc: "확인 후 복사 버튼을 눌러 결재 시스템에 붙여넣으세요.",
    Diagram: CopyModalDiagram,
    terms: null,
    advanceOn: { type: "custom-event", eventName: "copy-done" },
    instruction: "클립보드 복사 버튼을 클릭해보세요",
  },
];

export function useOnboardingTour() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  return {
    open,
    start: () => setOpen(true),
    close: () => setOpen(false),
  };
}

export default function OnboardingTour({
  state,
  onClose,
  onStepChange,
  remeasureSignal,
  mobileCartOpen,
}) {
  const [step, setStep] = useState(0);
  const [cardPos, setCardPos] = useState(null);
  const [arrowDir, setArrowDir] = useState("←");
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [targetRect, setTargetRect] = useState(null);
  const [mobileAnchor, setMobileAnchor] = useState("bottom");
  const [mobileCardOffset, setMobileCardOffset] = useState(null);
  const [targetMissing, setTargetMissing] = useState(false);
  const cardRef = useRef(null);
  const stepRef = useRef(step);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof matchMedia === "function" &&
      matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const mql = matchMedia("(max-width: 767px)");
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const current = STEPS[step];

  // 모바일: "선택 현황" 단계는 카트를 자동으로 열지 않고, 사용자가 직접
  // 플로팅 버튼을 눌러서 열게 한다 — 그 전까지는 버튼 쪽을 안내한다
  function getEffectiveStep(s) {
    const gatePending = isMobile && !!s.mobileGateSelector && !mobileCartOpen;
    if (!gatePending) return s;
    return {
      ...s,
      targetSelector: s.mobileGateSelector,
      highlightSelector: s.mobileGateSelector,
      instruction: s.mobileGateInstruction ?? s.instruction,
    };
  }

  const effectiveCurrent = getEffectiveStep(current);

  // 모바일: 스텝에 맞는 패널(스와이프 페이지/카트 오버레이)을 부모가 열어주도록 알림
  useEffect(() => {
    onStepChange?.(current.id);
  }, [step]);

  function measure() {
    const raw = STEPS[stepRef.current];
    const s = raw ? getEffectiveStep(raw) : raw;
    if (!s?.targetSelector) {
      setSpotlightRect(null);
      setTargetRect(null);
      setCardPos(null);
      setMobileCardOffset(null);
      return;
    }

    const targetEl = document.querySelector(s.targetSelector);
    if (!targetEl) {
      // 대상 요소를 찾지 못하면 spotlight 없이 카드를 화면 중앙에 띄워
      // 오버레이에 사용자가 갇히지 않도록 한다 (닫기/다음 버튼은 항상 보여야 함)
      setSpotlightRect(null);
      setTargetRect(null);
      setCardPos(null);
      setMobileCardOffset(null);
      setTargetMissing(true);
      return;
    }
    setTargetMissing(false);

    const tr = targetEl.getBoundingClientRect();
    setSpotlightRect({
      top: tr.top - PAD,
      left: tr.left - PAD,
      width: tr.width + PAD * 2,
      height: tr.height + PAD * 2,
    });
    setTargetRect({
      top: tr.top,
      left: tr.left,
      width: tr.width,
      height: tr.height,
    });

    // 모바일: 컬럼이 탭 전환으로 숨겨질 수 있어 옆 배치 대신 화면 상/하단에 고정.
    // 강조 대상(highlightSelector)이 화면 아래쪽에 있으면(예: 하단 고정 복사 버튼)
    // 카드를 위쪽에 붙여 서로 가리지 않게 한다.
    if (isMobile) {
      setCardPos(null);
      const hEl = s.highlightSelector
        ? document.querySelector(s.highlightSelector)
        : null;
      if (hEl) {
        const hr = hEl.getBoundingClientRect();
        if (s.mobileAnchorAboveTarget) {
          // 화면 가장자리가 아니라 대상 버튼 바로 위에 카드를 붙인다
          setMobileAnchor("bottom");
          setArrowDir("↓");
          setMobileCardOffset(
            Math.max(16, window.innerHeight - hr.top + MOBILE_ANCHOR_GAP),
          );
          return;
        }
        const hCenterY = hr.top + hr.height / 2;
        const anchor = hCenterY > window.innerHeight / 2 ? "top" : "bottom";
        setMobileAnchor(anchor);
        // 카드가 하단에 붙으면 대상은 위쪽에 있으므로 위쪽 화살표, 그 반대는 아래쪽 화살표
        setArrowDir(anchor === "bottom" ? "↑" : "↓");
        setMobileCardOffset(null);
      } else {
        setMobileAnchor("bottom");
        setArrowDir("↑");
        setMobileCardOffset(null);
      }
      return;
    }

    if (cardRef.current) {
      const cardW = cardRef.current.offsetWidth || 420;
      const cardH = cardRef.current.offsetHeight || 500;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const M = 16;

      let left = tr.right + M;
      let hDir = "←";
      if (left + cardW > vw - M) {
        left = tr.left - cardW - M;
        hDir = "→";
      }
      left = Math.max(M, left);

      let top = tr.top;
      top = Math.max(M, Math.min(top, vh - cardH - M));

      const cardCenterY = top + cardH / 2;
      const targetCenterY = tr.top + tr.height / 2;
      const DIAG_THRESHOLD = 60;
      let dir = hDir;
      if (cardCenterY > targetCenterY + DIAG_THRESHOLD) {
        dir = hDir === "←" ? "↖" : "↗";
      } else if (cardCenterY < targetCenterY - DIAG_THRESHOLD) {
        dir = hDir === "←" ? "↙" : "↘";
      }
      setArrowDir(dir);

      setCardPos({
        left: `${Math.round(left)}px`,
        top: `${Math.round(top)}px`,
      });
    }
  }

  // 스텝별 대상 요소에 pulse 애니메이션 부여 — 개별 엘리먼트에 직접 class를
  // 붙이면 선택 토글로 그 노드가 리렌더될 때 Preact가 class 속성을 통째로
  // 덮어써 사라진다. 대신 Preact가 건드리지 않는 document.body에 현재
  // highlightSelector를 data attribute로 심어두고 CSS로 매칭한다 —
  // 선택 여부와 무관하게 해당 selector의 모든 엘리먼트가 항상 pulse한다.
  useEffect(() => {
    if (!effectiveCurrent.highlightSelector) return;
    document.body.dataset.tourHighlight = effectiveCurrent.highlightSelector;
    return () => {
      delete document.body.dataset.tourHighlight;
    };
    // remeasureSignal: 모바일 카트 오버레이처럼 뒤늦게 mount되는 대상도 다시 조회하기 위함
  }, [step, remeasureSignal]);

  // 대상 요소 z-index 주입 — tour-root(z-index: auto)보다 위로 올림
  useEffect(() => {
    if (!effectiveCurrent.targetSelector) return;
    const el = document.querySelector(effectiveCurrent.targetSelector);
    if (!el) return;

    const restores = [];
    function elevate(node) {
      const cs = getComputedStyle(node);
      const prevPos = node.style.position;
      const prevZ = node.style.zIndex;
      if (cs.position === "static") node.style.position = "relative";
      node.style.zIndex = "1001";
      restores.push(() => {
        node.style.position = prevPos;
        node.style.zIndex = prevZ;
      });
    }

    elevate(el);
    // 모바일: 스와이프 트랙(transform)과 카트 오버레이(z-index:600)가 각자 별도의
    // stacking context를 만들어서, 대상 요소만 승격해서는 tour-blocker(z-index:1000)
    // 위로 뚫고 나오지 못함 — 해당 조상들도 함께 승격해야 함
    const swipeTrack = el.closest(".mobile-swipe-track");
    if (swipeTrack) elevate(swipeTrack);
    const cartOverlay = el.closest(".mobile-cart-overlay");
    if (cartOverlay) elevate(cartOverlay);

    return () => restores.forEach((fn) => fn());
    // remeasureSignal: 모바일에서 onStepChange가 부모의 mobilePage/cartOpen을 갱신한 뒤
    // (예: 카트 오버레이가 뒤늦게 mount) 대상 요소를 다시 찾아 승격하기 위함
  }, [step, remeasureSignal]);

  // 스텝 변경 시 측정
  useEffect(() => {
    setCardPos(null);
    setSpotlightRect(null);
    setTargetMissing(false);
    setMobileCardOffset(null);
    const raf = requestAnimationFrame(measure);
    // 모바일: 스와이프 페이지 전환 애니메이션(0.25s)이 끝난 뒤 위치 재측정
    const t = setTimeout(measure, 300);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [step]);

  // 모바일: 부모가 스와이프 페이지/카트 오버레이를 전환한 뒤 재측정
  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [remeasureSignal]);

  // 리사이즈/스크롤 재측정
  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, []);

  // 권한 없는 메뉴만 선택된 경우 perm 스텝 자동 통과
  useEffect(() => {
    if (current?.id !== "perm") return;
    if (state.selectedMenuSeqs.size === 0) return;
    const selectedMenus = state.menus.filter((m) =>
      state.selectedMenuSeqs.has(m.nodeId),
    );
    const allPermless = selectedMenus.every((m) => m.permissions.length === 0);
    if (allPermless) setStep((s) => s + 1);
  }, [state, step]);

  // click 기반 advance (1회) — container 있으면 이벤트 위임, 없으면 직접 부착
  useEffect(() => {
    if (!current?.advanceOn || current.advanceOn.type !== "click") return;
    const {
      selector,
      container,
      capture = false,
      excludeSelector,
      requireChild,
    } = current.advanceOn;

    function doAdvance() {
      if (step >= STEPS.length - 1) {
        localStorage.setItem(STORAGE_KEY, "1");
        onClose();
      } else {
        setStep((s) => s + 1);
      }
    }

    const cleanups = [];

    if (container) {
      const containerEl = document.querySelector(container);
      if (containerEl) {
        function delegated(e) {
          if (excludeSelector && e.target.closest(excludeSelector)) return;
          const target = e.target.closest(selector);
          if (!target) return;
          if (requireChild && !e.target.closest(requireChild)) return;
          const alreadyDone =
            target.classList.contains("is-checked") ||
            target.classList.contains("is-selected");
          if (!alreadyDone) doAdvance();
        }
        containerEl.addEventListener("click", delegated, capture);
        cleanups.push(() =>
          containerEl.removeEventListener("click", delegated, capture),
        );
      }
    } else {
      const el = document.querySelector(selector);
      if (el) {
        el.addEventListener("click", doAdvance);
        cleanups.push(() => el.removeEventListener("click", doAdvance));
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, [step, onClose]);

  // custom-event 기반 advance
  useEffect(() => {
    if (!current?.advanceOn || current.advanceOn.type !== "custom-event")
      return;
    const { eventName } = current.advanceOn;
    function handler() {
      if (step >= STEPS.length - 1) {
        localStorage.setItem(STORAGE_KEY, "1");
        onClose();
      } else {
        setStep((s) => s + 1);
      }
    }
    document.addEventListener(eventName, handler);
    return () => document.removeEventListener(eventName, handler);
  }, [step, onClose]);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  }

  // Esc 키는 대상 요소 탐색 성패와 무관하게 항상 투어를 종료할 수 있어야 함
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") finish();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const hasResolvedTarget = current.targetSelector && !targetMissing;

  return (
    <div class="tour-root">
      {/* 오버레이: spotlight 스텝엔 투명 차단 레이어, overview·대상 못 찾음엔 어두운 배경 */}
      {hasResolvedTarget ? (
        <div class="tour-blocker" />
      ) : (
        <div class="tour-overlay" />
      )}

      {/* 스포트라이트 링 */}
      {spotlightRect && (
        <div
          class="tour-spotlight"
          style={{
            top: spotlightRect.top + "px",
            left: spotlightRect.left + "px",
            width: spotlightRect.width + "px",
            height: spotlightRect.height + "px",
          }}
        />
      )}

      {/* 타겟 요소 glow 강조 */}
      {targetRect && (
        <div
          class="tour-target-highlight"
          style={{
            top: targetRect.top + "px",
            left: targetRect.left + "px",
            width: targetRect.width + "px",
            height: targetRect.height + "px",
          }}
        />
      )}

      {/* 카드 */}
      <div
        ref={cardRef}
        class={`tour-card${
          hasResolvedTarget
            ? isMobile
              ? ` tour-card--mobile-anchored tour-card--anchor-${mobileAnchor}`
              : " tour-card--placed"
            : " tour-card--center"
        }`}
        style={
          hasResolvedTarget && !isMobile
            ? cardPos
              ? { left: cardPos.left, top: cardPos.top }
              : { visibility: "hidden" }
            : hasResolvedTarget && isMobile && mobileCardOffset != null
              ? { bottom: `${Math.round(mobileCardOffset)}px` }
              : undefined
        }
      >
        <button class="tour-close-btn" onClick={finish} aria-label="닫기">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="tour-steps">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              class={`tour-step-dot${i === step ? " is-active" : ""}`}
            />
          ))}
        </div>

        <h3 class="tour-title">{current.title}</h3>
        <p class="tour-desc">
          {isMobile && current.mobileDesc ? current.mobileDesc : current.desc}
        </p>

        {current.Diagram && !(isMobile && current.id === "copy") && (
          <div class="tour-diagram">
            <current.Diagram />
          </div>
        )}

        {current.terms?.length > 0 && (
          <div class="tour-terms">
            {current.terms.map((t) => (
              <div key={t.label} class="tour-term">
                {t.Chip ? (
                  <span class="badge badge-warn tour-term-chip">{t.Chip}</span>
                ) : (
                  <span
                    class={`tour-term-icon${t.iconTone ? ` tour-term-icon--${t.iconTone}` : ""}`}
                  >
                    <t.Icon />
                  </span>
                )}
                <div>
                  <div class="tour-term-label">{t.label}</div>
                  <div class="tour-term-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {effectiveCurrent.instruction && (
          <div class="tour-instruction">
            <span class="tour-instruction-arrow">{arrowDir}</span>
            {effectiveCurrent.instruction}
          </div>
        )}

        <div class="tour-footer">
          {step === 0 ? (
            <button class="btn btn-primary" onClick={() => setStep(1)}>
              시작하기
            </button>
          ) : (
            <button
              class="btn btn-ghost tour-skip-btn"
              onClick={
                step < STEPS.length - 1 ? () => setStep((s) => s + 1) : finish
              }
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
