// 샘플 모드(dev:sample/build:sample) 전용 테마 데이터셋 레지스트리.
// import.meta.env.IS_SAMPLE_MODE가 true일 때만 이 모듈이 lazy-load되므로
// (App.jsx의 SampleModeSwitcher 조건부 import 참고) 실빌드 산출물에는 포함되지 않는다.
import DEFAULT_MENUS from "../data/menus.json";
import { HELP_TEXTS as DEFAULT_HELP_TEXTS } from "../data/helpTexts.js";
import { SHORTCUTS as DEFAULT_SHORTCUTS } from "../data/shortcuts.js";
import { GLOSSARY as DEFAULT_GLOSSARY } from "../data/glossary.js";

import MAPLESTORY_MENUS from "../data/samples/menus.sample.maplestory.json";
import { HELP_TEXTS as MAPLESTORY_HELP_TEXTS } from "../data/samples/helpTexts.sample.maplestory.js";
import { SHORTCUTS as MAPLESTORY_SHORTCUTS } from "../data/samples/shortcuts.sample.maplestory.js";
import { GLOSSARY as MAPLESTORY_GLOSSARY } from "../data/samples/glossary.sample.maplestory.js";

import ONEPIECE_MENUS from "../data/samples/menus.sample.onepiece.json";
import { HELP_TEXTS as ONEPIECE_HELP_TEXTS } from "../data/samples/helpTexts.sample.onepiece.js";
import { SHORTCUTS as ONEPIECE_SHORTCUTS } from "../data/samples/shortcuts.sample.onepiece.js";
import { GLOSSARY as ONEPIECE_GLOSSARY } from "../data/samples/glossary.sample.onepiece.js";

import COMPANY_MENUS from "../data/samples/menus.sample.company.json";
import { HELP_TEXTS as COMPANY_HELP_TEXTS } from "../data/samples/helpTexts.sample.company.js";
import { SHORTCUTS as COMPANY_SHORTCUTS } from "../data/samples/shortcuts.sample.company.js";
import { GLOSSARY as COMPANY_GLOSSARY } from "../data/samples/glossary.sample.company.js";

import { parseMenus } from "./jsonLoader.js";
import { setActiveShortcuts, setActiveGlossary } from "./activeDataset.js";

export const SAMPLE_MODES = [
  {
    id: "default",
    label: "게이밍 기기 회사 (기본)",
    menus: DEFAULT_MENUS,
    helpTexts: DEFAULT_HELP_TEXTS,
    shortcuts: DEFAULT_SHORTCUTS,
    glossary: DEFAULT_GLOSSARY,
  },
  {
    id: "maplestory",
    label: "메이플스토리 모드",
    menus: MAPLESTORY_MENUS,
    helpTexts: MAPLESTORY_HELP_TEXTS,
    shortcuts: MAPLESTORY_SHORTCUTS,
    glossary: MAPLESTORY_GLOSSARY,
  },
  {
    id: "onepiece",
    label: "원피스 모드",
    menus: ONEPIECE_MENUS,
    helpTexts: ONEPIECE_HELP_TEXTS,
    shortcuts: ONEPIECE_SHORTCUTS,
    glossary: ONEPIECE_GLOSSARY,
  },
  {
    id: "company",
    label: "일반 회사 모드",
    menus: COMPANY_MENUS,
    helpTexts: COMPANY_HELP_TEXTS,
    shortcuts: COMPANY_SHORTCUTS,
    glossary: COMPANY_GLOSSARY,
  },
];

// 모드 전환: shortcuts/glossary 싱글턴 교체 → 선택 상태 초기화 → 새 메뉴로 교체
export function applySampleMode(mode, dispatch) {
  setActiveShortcuts(mode.shortcuts);
  setActiveGlossary(mode.glossary);
  dispatch({ type: "RESET" });
  dispatch({
    type: "SET_MENUS",
    menus: parseMenus(mode.menus, { helpTexts: mode.helpTexts }),
  });
}
