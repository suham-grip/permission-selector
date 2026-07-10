export function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path d="M4 2l4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg
      viewBox="0 0 20 22"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
    >
      <rect x="2.5" y="9" width="15" height="12" rx="2.5" />
      <path d="M6 9V7a4 4 0 018 0v2" stroke-linecap="round" />
    </svg>
  );
}

/** 메뉴/상세권한이 나란히 배치되고, 선택 현황은 항상 우측 고정인 모양 (가로 배치) */
export function LayoutSideBySideIcon() {
  return (
    <svg
      viewBox="0 0 22 14"
      fill="none"
      stroke="currentColor"
      stroke-width="1.3"
    >
      <rect x="1" y="1" width="6" height="12" rx="1.1" />
      <rect x="8.5" y="1" width="6" height="12" rx="1.1" />
      <rect x="16" y="1" width="5" height="12" rx="1.1" fill="currentColor" fill-opacity="0.25" />
    </svg>
  );
}

/** 메뉴가 위, 상세권한이 아래로 쌓이고, 선택 현황은 항상 우측 고정인 모양 (세로 배치) */
export function LayoutStackedIcon() {
  return (
    <svg
      viewBox="0 0 22 14"
      fill="none"
      stroke="currentColor"
      stroke-width="1.3"
    >
      <rect x="1" y="1" width="14" height="5.2" rx="1.1" />
      <rect x="1" y="7.8" width="14" height="5.2" rx="1.1" />
      <rect x="16" y="1" width="5" height="12" rx="1.1" fill="currentColor" fill-opacity="0.25" />
    </svg>
  );
}
