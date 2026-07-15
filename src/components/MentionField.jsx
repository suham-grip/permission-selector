import { useRef, useState, useEffect } from "preact/hooks";

const normalize = s => s.replace(/\s+/g, "").toLowerCase();
const MARKER_RE = /\[\[(.+?)\]\]/g;

// "[[용어]]" 마커 기준으로 원문 문자열을 텍스트/칩 조각으로 분해
function parseSegments(value) {
  const segments = [];
  if (!value) return segments;
  let lastEnd = 0;
  let m;
  MARKER_RE.lastIndex = 0;
  while ((m = MARKER_RE.exec(value))) {
    if (m.index > lastEnd) segments.push({ type: "text", text: value.slice(lastEnd, m.index) });
    segments.push({ type: "chip", term: m[1] });
    lastEnd = MARKER_RE.lastIndex;
  }
  if (lastEnd < value.length) segments.push({ type: "text", text: value.slice(lastEnd) });
  return segments;
}

// 용어집에 등록된 용어를 "@용어" 칩으로 보여주는, contenteditable 안에서만 쓰는 원자 노드
function makeChip(term) {
  const span = document.createElement("span");
  span.className = "glossary-term-edit";
  span.contentEditable = "false";
  span.dataset.term = term;
  span.textContent = "@" + term;
  return span;
}

// value(raw 문자열) → contenteditable 자식 노드로 재구성. 값이 외부에서(선택 변경 등) 바뀌었을 때만 호출
function buildDom(el, value, terms) {
  el.innerHTML = "";
  for (const seg of parseSegments(value)) {
    if (seg.type === "chip" && terms.includes(seg.term)) {
      el.appendChild(makeChip(seg.term));
    } else if (seg.type === "chip") {
      el.appendChild(document.createTextNode(`[[${seg.term}]]`));
    } else {
      el.appendChild(document.createTextNode(seg.text));
    }
  }
  el.classList.toggle("is-empty", !value);
}

// contenteditable 자식 노드 → raw 문자열("[[용어]]" 마커 포함)로 역직렬화
function serialize(el) {
  let out = "";
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) out += node.textContent;
    else if (node.dataset?.term != null) out += `[[${node.dataset.term}]]`;
  }
  return out;
}

const PANEL_WIDTH = 220;
const PANEL_HEIGHT = 220;

/**
 * "@"로 용어집 단어를 검색해 [[용어]]로 삽입하는 자동완성 필드.
 * 실제로는 contenteditable div — 등록된 용어는 "@용어" 칩으로 렌더링되고,
 * 저장되는 값(onInput으로 올라가는 문자열)은 항상 "[[용어]]" 원문 그대로 유지된다.
 */
export default function MentionField({
  as = "input", value, onInput, class: cls, style, placeholder,
  terms = [], onAddTerm,
}) {
  const elRef = useRef(null);
  const panelRef = useRef(null);
  const composingRef = useRef(false);
  const ignoreNextCompositionEndRef = useRef(false);
  const lastRawRef = useRef(value ?? "");
  const [mention, setMention] = useState(null); // { node, start, end, query }
  const [highlight, setHighlight] = useState(0);
  const [pos, setPos] = useState(null);

  // 부모가 value를 외부에서 바꾼 경우(다른 항목 선택 등)에만 DOM을 재구성한다.
  // 포커스가 이 필드에 있는 동안은 절대 재구성하지 않는다 — 빠른 연속 타이핑 중에는
  // 매 키 입력마다 리렌더/effect가 뒤늦게 순서 없이 실행될 수 있는데, 문자열 값을
  // 기준으로 비교하면(예: 직전 커밋값과 비교) 그 사이 실제 DOM은 이미 더 앞서
  // 있을 수 있어 오래된 값으로 잘못 재구성되며 캐럿이 매번 리셋되는 문제가 있었다.
  // 포커스 여부만 보면 이런 타이밍 경합과 무관하게 안전하다.
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const v = value ?? "";
    if (v === serialize(el)) return;
    buildDom(el, v, terms);
  }, [value, terms]);

  const query = mention?.query ?? "";
  const filtered = mention ? terms.filter(t => normalize(t).includes(normalize(query))) : [];
  const hasExact = terms.some(t => normalize(t) === normalize(query));
  const showAdd = !!(mention && query.trim() && !hasExact);
  const options = showAdd ? [...filtered, { isAdd: true, term: query.trim() }] : filtered;

  function detectMention() {
    const el = elRef.current;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE || !el.contains(node)) return null;
    const text = node.textContent;
    const caret = range.startOffset;
    let i = caret;
    let consecutiveSpaces = 0;
    while (i > 0) {
      const ch = text[i - 1];
      if (ch === "@") return { node, start: i - 1, end: caret, query: text.slice(i, caret) };
      if (ch === "\n") break;
      // 스페이스 2개 연속이면 태그를 달 의사가 없는 것으로 보고 스캔을 멈춘다.
      if (ch === " ") {
        consecutiveSpaces++;
        if (consecutiveSpaces >= 2) break;
      } else {
        consecutiveSpaces = 0;
      }
      i--;
    }
    return null;
  }

  function updateMentionPanel() {
    const prev = mention;
    const m = detectMention();
    setMention(m);
    setHighlight(0);
    if (!m) return;
    // 패널 위치는 캐럿이 아니라 "@" 문자 위치(m.start)를 기준으로 고정되므로, 같은
    // 멘션 세션 안에서 검색어만 바뀔 때는 앵커가 그대로다. getBoundingClientRect()는
    // 강제 동기 레이아웃을 유발해 큰 트리가 함께 마운트된 페이지에서 체감 가능한
    // 입력 지연을 만들므로, 세션이 바뀔 때(다른 "@" 또는 새 세션 시작)만 재계산한다.
    if (prev && prev.node === m.node && prev.start === m.start) return;
    const range = document.createRange();
    range.setStart(m.node, m.start);
    range.setEnd(m.node, m.start);
    const rect = range.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < PANEL_HEIGHT && rect.top > spaceBelow) {
      setPos({ bottom: window.innerHeight - rect.top + 2, left: rect.left });
    } else {
      setPos({ top: rect.bottom + 2, left: rect.left });
    }
  }

  // 방금 입력이 완성된 "[[용어]]"를 자동으로 칩으로 승격(수동 타이핑 지원)
  function autoChipify() {
    const el = elRef.current;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE || !el.contains(node)) return;
    const text = node.textContent;
    const caret = range.startOffset;
    const before = text.slice(0, caret);
    const m = /\[\[([^[\]]+)\]\]$/.exec(before);
    if (!m || !terms.includes(m[1])) return;
    const matchStart = m.index;
    const after = text.slice(caret);
    const beforeText = text.slice(0, matchStart);
    const chip = makeChip(m[1]);
    const afterNode = document.createTextNode(after);
    node.textContent = beforeText;
    node.parentNode.insertBefore(chip, node.nextSibling);
    node.parentNode.insertBefore(afterNode, chip.nextSibling);
    const newRange = document.createRange();
    newRange.setStart(afterNode, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  function handleInput() {
    const el = elRef.current;
    // 조합 중에 normalize()로 텍스트 노드를 합치면 브라우저가 추적 중인 조합 범위가
    // 깨져 한글 입력이 이상하게 끊기므로, 조합이 끝난 뒤에만 정리한다.
    if (!composingRef.current) {
      el.normalize();
      autoChipify();
    }
    const raw = serialize(el);
    el.classList.toggle("is-empty", !raw);
    lastRawRef.current = raw;
    onInput(raw);
    // 조합 중에도 자동완성 패널은 계속 갱신한다 — 실제 DOM에 반영된 조합 중 텍스트를
    // 그대로 읽기만 할 뿐 변형하지 않으므로 조합을 방해하지 않는다.
    updateMentionPanel();
  }

  function insertNewline() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const nl = document.createTextNode("\n");
    range.insertNode(nl);
    range.setStartAfter(nl);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    handleInput();
  }

  function commit(opt) {
    const el = elRef.current;
    const term = opt.isAdd ? opt.term : opt;
    if (opt.isAdd) onAddTerm(term);
    // state의 mention은 마지막 렌더 시점 값이라 조합 입력 중엔 실제 캐럿보다 한 박자
    // 늦을 수 있다 — 커밋 시점에 캐럿 위치를 다시 읽어 끝 글자 중복 삽입을 막는다.
    const { node, start, end } = detectMention() ?? mention;
    const text = node.textContent;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const chip = makeChip(term);
    const afterNode = document.createTextNode(after);
    node.textContent = before;
    node.parentNode.insertBefore(chip, node.nextSibling);
    node.parentNode.insertBefore(afterNode, chip.nextSibling);
    const sel = window.getSelection();
    const newRange = document.createRange();
    newRange.setStart(afterNode, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    setMention(null);
    const raw = serialize(el);
    el.classList.toggle("is-empty", !raw);
    onInput(raw);
    requestAnimationFrame(() => el.focus());
  }

  function handleKeyDown(e) {
    // 한글 등 조합 입력 중에 눌리는 Enter는 IME가 조합을 확정하는 데도 쓰인다.
    // 이걸 여기서 같이 처리하면(preventDefault로 막을 수 없는 조합 확정이 우리 커밋
    // 처리 직후에 뒤늦게 일어나면서) 확정된 마지막 글자가 커밋된 칩 뒤에 한 번 더
    // 삽입되어 버린다 — 조합 중에는 아무 것도 하지 않고 조합이 끝난 뒤 다시 누르게 한다.
    if (e.isComposing) return;
    if (mention && options.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight(h => Math.min(h + 1, options.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight(h => Math.max(h - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        commit(options[highlight]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMention(null);
        return;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (as === "textarea") insertNewline();
    }
  }

  useEffect(() => {
    if (!mention) return;
    function handleClick(e) {
      if (elRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setMention(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mention]);

  return (
    <>
      <div
        ref={elRef}
        class={`${cls ?? ""} edit-mention-field${as === "textarea" ? "" : " is-input-mode"}`}
        style={style}
        data-placeholder={placeholder}
        role="textbox"
        aria-multiline={as === "textarea"}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        // Chrome 등 일부 브라우저는 contentEditable 조합 중에는 input 이벤트를
        // 안정적으로 발생시키지 않는다(input/textarea와 달리) — compositionupdate를
        // 직접 구독해 조합 중간 글자도 부모 상태(좌측 목록 등)에 실시간 반영되게 한다.
        onCompositionUpdate={handleInput}
        onCompositionEnd={() => {
          if (ignoreNextCompositionEndRef.current) {
            ignoreNextCompositionEndRef.current = false;
            return;
          }
          composingRef.current = false;
          handleInput();
        }}
        onBlur={() => {
          if (!composingRef.current) return;
          // 일부 브라우저는 조합 도중 blur가 발생하면 compositionend가 채 발화되기도
          // 전에 DOM을 조합 시작 이전 상태로 되돌려버린다 — 이 시점에 el을 다시
          // serialize()하면 이미 비워진/손상된 내용을 읽게 된다. 그래서 DOM을 다시
          // 읽지 않고, 매 입력마다 갱신해 둔 lastRawRef(조합 중 마지막으로 확인된
          // 온전한 값)를 그대로 커밋한다. 뒤이어 브라우저가 발생시키는 compositionend는
          // 마찬가지로 손상된 DOM을 담고 있을 수 있어 무시한다.
          composingRef.current = false;
          ignoreNextCompositionEndRef.current = true;
          const el = elRef.current;
          const raw = lastRawRef.current;
          el.classList.toggle("is-empty", !raw);
          onInput(raw);
        }}
      />
      {mention && pos && (
        <div
          class="edit-ms-panel edit-mention-panel"
          ref={panelRef}
          style={{
            top: pos.top != null ? pos.top + "px" : undefined,
            bottom: pos.bottom != null ? pos.bottom + "px" : undefined,
            left: pos.left + "px",
            width: PANEL_WIDTH + "px",
          }}
        >
          <div class="edit-ms-list">
            {options.map((opt, i) => (
              <div
                key={opt.isAdd ? "__add" : opt}
                class={`edit-ms-item${i === highlight ? " is-highlighted" : ""}${opt.isAdd ? " is-add-new" : ""}`}
                onMouseDown={e => { e.preventDefault(); commit(opt); }}
              >
                {opt.isAdd ? `@${opt.term} 추가하기` : opt}
              </div>
            ))}
            {options.length === 0 && <div class="edit-ms-empty">결과 없음</div>}
          </div>
        </div>
      )}
    </>
  );
}
