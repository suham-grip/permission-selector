import { createPortal } from "preact/compat";

// position: fixed 툴팁/말풍선을 document.body에 직접 렌더링한다.
// 조상에 transform이 걸려 있으면(예: 모바일 스와이프 트랙) fixed의 containing block이
// 뷰포트가 아니라 그 조상으로 바뀌어 getBoundingClientRect 기반 좌표 계산이 어긋나므로,
// 항상 body 기준으로 배치되도록 트리 밖으로 이동시킨다.
export default function Portal({ children }) {
  return createPortal(children, document.body);
}
