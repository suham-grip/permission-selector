# 권한 선택 페이지 — CLAUDE.md

## 프로젝트 개요

어드민 권한 신청 시 사용자가 직접 텍스트로 권한을 입력하다가 발생하는 오입력을 방지하는 단일 페이지 앱.
사용자가 필요한 권한 메뉴와 상세 권한을 선택하면 클립보드 복사용 텍스트를 생성해준다.

빌드 결과물: 단일 HTML 파일 (`dist/index.html`). 더블클릭으로 바로 열 수 있어야 한다.

---

## 브랜딩

- 로고: `https://gripshow.notion.site/image/...` (명세 참조)
- 주색: `#FF3C78` → CSS 변수 `--brand`
- 서체: `'Poppins', 'Pretendard', sans-serif`
  - Poppins: Google Fonts (라틴 전용)
  - Pretendard: jsdelivr CDN (한글 폴백)

---

## 기술 스택

- Vite + Preact + JSX
- 상태: `useReducer` (전역), `useState` (로컬 UI)
- 빌드: `vite-plugin-singlefile`
- 스타일: 순수 CSS + CSS 변수, 외부 UI 라이브러리 없음
- `class=` 사용 (`className=` 아님 — Preact)
- import는 `preact/hooks`에서

---

## 입력 데이터 구조

데이터는 외부 파일/API에서 불러오지 않고 소스에 직접 입력한다 (`src/data/menus.json`, `jsonLoader.js`가 정규화). 정확한 원본/정규화 구조는 소스 참고.

**코드만 봐서는 알기 어려운 규칙:**

- `restricted: true` = 좌측 메뉴에 없고, 다른 페이지에서 링크로만 접근 가능한 페이지 (숨김 처리일 뿐 접근 자체를 막는 게 아님)
- `permissions` 트리에 어떤 메뉴도 참조하지 않는 leaf(orphan)가 있을 수 있음. UI에는 노출되지 않음
- 서로 다른 메뉴가 같은 `permissionCode`를 참조하면 동일 권한으로 취급 (상세 권한 패널의 "전체" 보기에서는 중복 제거)

---

## 내부 상태 (state.js)

`initialState`/`reducer` 정의 및 필드는 소스 참고. action type: `SET_MENUS`, `TOGGLE_MENU`, `TOGGLE_PERM`, `SET_FOCUSED_MENU`, `SET_PERM_FILTER`, `SET_MENU_SEARCH`, `SET_PERM_SEARCH`, `ACTIVATE_SHORTCUT`, `DEACTIVATE_SHORTCUT`, `RESET`.

- `SET_PERM_FILTER`: 같은 `permCode`를 다시 dispatch하면 토글 해제(`null`)
- `ACTIVATE_SHORTCUT` / `DEACTIVATE_SHORTCUT`: `shortcut.menus`/`shortcut.perms`를 일괄 추가/제거. `DEACTIVATE_SHORTCUT`이 현재 `focusedMenuSeq`를 포함하면 포커스도 해제

---

## 화면 레이아웃 (3단 구성)

```
┌─────────────────────────────────────────────────────────┐
│  헤더 (로고 + 타이틀)                                       │
├──────────────┬──────────────────────┬───────────────────┤
│  권한 메뉴    │    상세 권한          │   선택 현황        │
│  (트리)      │    (목록)            │   (카트 패널)      │
│  280px       │    flex-1            │   300px           │
│              │                      │                   │
│  [검색창]    │  [검색창]            │  선택된 메뉴 목록  │
│              │                      │  선택된 상세권한   │
│  트리 노드   │  체크박스 목록       │                   │
│  클릭 시     │  (focusedMenu 기준   │  [클립보드 복사]   │
│  오른쪽 필터 │   또는 전체)         │  버튼             │
└──────────────┴──────────────────────┴───────────────────┘
```

**레이아웃 전환:** 헤더의 레이아웃 토글 버튼(`App.jsx`, `layout-toggle-btn`)으로 권한 메뉴/상세 권한을 가로 배치(기본) ↔ 세로 배치로 전환. 아이콘(`components/icons.jsx`)이 클릭 시 바뀔 모양을 미리 보여주는 방식 — "가로/세로 보기" 상태 라벨은 화면 회전과 혼동될 수 있어 상태 텍스트 대신 아이콘 우선으로 결정. 두 컬럼은 `.col-menu-perm-group` 래퍼로 감싸 CSS만 전환하고 `MenuTree`/`PermissionList`는 리마운트되지 않음(펼침·스크롤·검색 상태 유지). 세로 모드는 드래그 핸들로 높이 비율(20~80%) 조절 가능. 모드/비율은 `localStorage`(`layout_stacked`, `layout_split_pct`)에 저장되어 새로고침 후에도 유지.

**반응형 지원 범위:** 데스크톱뿐 아니라 태블릿·모바일 폭까지 대응한다.
- **데스크톱 (≥1040px)**: 위 3단 고정폭 레이아웃 그대로.
- **태블릿 (768~1039px)**: 3단 컬럼을 유지하되 폭만 `%`/`flex`로 유동화(`layout.css`). 세로 보기 토글·리사이즈 핸들 그대로 사용 가능.
- **모바일 (<768px)**: 메뉴/상세 권한/선택 현황을 동시에 표시할 수 없어 상단 탭 전환 방식으로 전환(`App.jsx`의 `isMobile`/`activePanel` state, `.mobile-panel-tabs`). 세로 보기 토글과 리사이즈 핸들은 숨김. 메뉴에서 최하위 항목을 선택하면 상세 권한 탭으로 자동 전환됨. hover 전용 툴팁(`HelpTooltip`, 트리 아이콘 툴팁, 상세 권한 카드 도움말)은 `src/lib/useTooltip.js`를 통해 터치 기기에서 탭으로 열고 바깥 탭으로 닫히도록 처리.

---

## 핵심 기능 명세

### 1. 메뉴 트리 (MenuTree.jsx)

- 중간 노드: 접기/펼치기만. 최하위 노드: 선택 토글
- 검색 시: 트리 자체는 필터링하지 않고, 매칭된 메뉴를 breadcrumb과 함께 별도 목록으로 표시
  - 조상-자손이 동시에 매칭되면 조상은 생략하고 가장 하위 매칭만 표시(breadcrumb에 조상명이 이미 포함되므로 정보 손실 없음)
  - 목록 항목 클릭 시: 조상 펼침 + 검색어 초기화 + 스크롤/강조만 수행 — `SET_FOCUSED_MENU`는 dispatch하지 않음(단순 위치 확인용)
- 노드 클릭(최하위) → `SET_FOCUSED_MENU` dispatch → 상세 권한 패널 필터링

### 2. 상세 권한 목록 (PermissionList.jsx)

- `focusedMenuSeq`가 있으면 해당 메뉴의 permissions만, 없으면 전체 메뉴의 permissions를 `permissionCode` 기준 중복 제거해 표시
- 검색: label 기준 필터링, 선택 시 `TOGGLE_PERM` dispatch

### 3. 선택 현황 패널 (CartPanel.jsx)

트리 구조(`├`, `└`, `│`)로 선택된 메뉴/권한 표시.

- 헤더 카운트 pill의 권한 수는 `selectedPermCodes.size`(중복 제거된 고유 수)
- 메뉴 항목의 `N개 중 N개` 뱃지는 해당 메뉴의 상세권한 선택 현황(상세권한 없는 메뉴는 미표시)
- **뷰 모드 (`viewMode`: `'tree' | 'split'`)**: "트리"는 메뉴 아래 소속 권한을 들여쓰기 표시(`N/N개` 뱃지 클릭으로 접기/펼치기), "분리"는 메뉴 트리(권한 없이)와 상세 권한 목록(중복 제거)을 별도 섹션으로 분리
- **orphan perms**: `computeOrphanPerms`(`tree.js`)로 계산한, 선택된 메뉴 어디에도 속하지 않은 선택된 permissionCode. 트리 하단에 별도 표시
- 초기화 버튼 클릭 시 커스텀 확인 모달 → 확인 시 `RESET` dispatch

### 4. 유효성 검사 (validate.js)

`validate(state)` → `{ errors, warnings, missingMenus, approvalPerms, needsApproval, orphanPerms }` — `approvalPerms`/`orphanPerms`는 permissionCode 기준 중복 제거, orphan도 포함.

| 조건                                     | 종류    | 메시지                                               |
| ---------------------------------------- | ------- | ---------------------------------------------------- |
| 메뉴·권한 모두 미선택                    | error   | "권한 메뉴 또는 상세 권한을 선택해주세요."           |
| permissions 있는 메뉴에 상세 권한 미선택 | warning | "상세 권한을 선택하지 않은 메뉴가 있습니다."         |
| 연결된 메뉴 없이 선택된 상세 권한 존재   | warning | "연결된 메뉴 없이 선택된 상세 권한이 있습니다."      |
| `requiresApproval` 권한 포함             | warning | "보안담당자 결재가 필요한 권한이 포함되어 있습니다." |

### 5. 복사 모달 (CopyModal.jsx)

- errors가 있으면 "알겠습니다" 버튼 없이 닫기만, warnings만 있으면 "알겠습니다, 복사"로 복사 진행
- 세 종류 notice(상세권한 미선택 메뉴 / 메뉴 없는 상세권한 / 결재 필요)는 각각 접기/펼치기 토글(`ExpandSection`)로 상세 목록 표시

### 6. 클립보드 포맷 (clipboard.js)

"메뉴명" / "상세 권한" 두 섹션으로 나눈 평문. `generateClipboardText`는 텍스트, `generateClipboardHtml`은 서식 있는 HTML을 생성(둘 다 `buildLines` 공통 로직 사용, `title > ` 부분만 굵게 렌더링).

```
메뉴명
이용자 관리 > 이용자

상세 권한
이용자 외 1개 > 이용자 조회
권한 메뉴 없음 > 상품 조회
```

- "메뉴명": 선택된 leaf 메뉴만 DFS 순서로 전체 경로("A > B > C") 나열
- "상세 권한": 선택된 permissionCode를 DFS 순서 + 중복 제거로 `메뉴명 > 권한설명` 나열
  - 같은 권한을 여러 메뉴가 공유하면 첫 메뉴명 뒤에 `외 N개` 표기
  - orphan 권한(`computeOrphanPerms`)은 `권한 메뉴 없음 > 권한설명`으로 표시, 섹션 끝에 추가
- 각 섹션은 항목이 없으면 헤더 포함 생략. restricted/requiresApproval 등 부가 정보는 표시 안 함

---

## tree.js 핵심 유틸

`isLeaf`, `getAncestorPath`, `buildTree`, `computeOrphanPerms` 제공 — 시그니처와 동작은 소스 참고.

**단축 선택 (shortcuts):**

`src/data/shortcuts.js`의 `SHORTCUTS`(nodeId → 라벨별 `{ label, menus, perms, cascades }`)를 `lib/shortcuts.js`가 소비해, 메뉴/권한 칩 클릭 한 번으로 여러 메뉴·권한을 한꺼번에 선택/해제(`ACTIVATE_SHORTCUT`/`DEACTIVATE_SHORTCUT`)할 수 있게 한다. `cascades`(`"nodeId:label"` 형식)로 다른 메뉴의 shortcut을 연쇄 포함할 수 있다(`getEffectiveTargets`가 BFS로 전개). `getActiveShortcutLabels`는 특정 메뉴에서 현재 선택 상태와 완전히 일치하는 shortcut 라벨들을 판별해 칩 활성 표시에 사용한다.

---

## CSS 변수

`base.css`의 `:root`에 정의. 주색은 `--brand`(#FF3C78, 브랜딩 참고), 그 외 색상/radius 변수는 소스 참고 — 신규 색상 추가 시 여기 문서를 따로 갱신하지 말고 `base.css`를 단일 소스로 유지할 것.

---

## 코드 규칙

- `class=` (not `className=`) — Preact 방식
- import는 `preact/hooks`에서: `import { useState, useReducer, useCallback } from 'preact/hooks'`
- 상태 변경은 `dispatch({ type: ... })` 우선
- 인라인 스타일 지양, CSS 클래스 우선
- 주석은 한국어, 필요한 곳만
- 디바운스 150ms (검색 인풋)

---

## 빌드

```bash
npm run dev    # 개발 서버
npm run build  # dist/index.html 단일 파일 출력
```

---

## 깃 컨벤션 (1인 프로젝트)

혼자 하는 **공개(public)** 저장소 — 협업이 아니라 "미래의 나"를 위한 가벼운 규칙.

- `main` 직접 커밋 기본, 실험적 작업만 짧은 브랜치(`feat/xxx`). GitFlow 안 씀
- 커밋 메시지: Conventional Commits 접두사(`feat`/`fix`/`refactor`/`chore`/`docs`/`style`/`test`) + 한국어 본문
- 하나의 논리적 변경 = 한 커밋. 의미 있는 배포 시점에만 `git tag vX.Y.Z` + `package.json` version 동기화
- PR 필수화·브랜치 보호·CODEOWNERS·수기 CHANGELOG·강제 pre-commit 훅 등 오버엔지니어링 금지

### 공개 저장소 데이터 분리 (필수)

사내 식별 정보(실제 메뉴/권한 구조, Slack 워크스페이스·member ID, 담당자 실명 등)는 **절대 커밋하지 않는다.**

- 실데이터는 `src/data/*`(gitignore됨), 공개용은 `*.sample.*`만 커밋 (`menus.json`, `helpTexts.js`, `shortcuts.js`, `glossary.js`, `contact.js` 각각 쌍)
- 문의처 등 사내 정보는 `src/data/contact.js`(gitignore)로 분리해 `App.jsx`가 `CONTACT`를 import
- 새 데이터 쌍 추가 시 `scripts/dev-with-sample.mjs`의 `PAIRS`에도 등록
- clone 직후엔 실데이터가 없어 빌드 불가 — `npm run dev:sample`로 샘플 데이터 사용

---

## 만들지 말 것 (scope out)

- 사용자 계정/로그인 관련 기능
- 권한 신청 제출/API 연동
- 서버 사이드 로직
- 다국어(i18n)
- JSON 파일 업로드 UI (데이터는 소스에 하드코딩 또는 import)
