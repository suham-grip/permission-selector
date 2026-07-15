// 샘플 모드 전환(SampleModeSwitcher)이 SHORTCUTS/GLOSSARY를 런타임에 바꿔 낄 수 있도록 하는
// 모듈 싱글턴. 콜사이트가 여러 컴포넌트/lib에 흩어져 있어(MenuTree, PermissionList, CartPanel,
// CopyModal, clipboard.js 등) 매번 파라미터로 꿰어 넘기는 대신 getter로 통일한다.
// 기본값은 지금까지와 동일하게 실데이터/샘플 경로(vite 리졸버가 처리) import.
import { SHORTCUTS as DEFAULT_SHORTCUTS } from "../data/shortcuts.js";
import { GLOSSARY as DEFAULT_GLOSSARY } from "../data/glossary.js";

let activeShortcuts = DEFAULT_SHORTCUTS;
let activeGlossary = DEFAULT_GLOSSARY;

export function getActiveShortcuts() {
  return activeShortcuts;
}

export function setActiveShortcuts(shortcuts) {
  activeShortcuts = shortcuts;
}

export function getActiveGlossary() {
  return activeGlossary;
}

export function setActiveGlossary(glossary) {
  activeGlossary = glossary;
}
