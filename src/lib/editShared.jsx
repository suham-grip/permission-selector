import { useState, useEffect, useRef } from "preact/hooks";

export function HiddenBadge() {
  return (
    <svg
      class="edit-hidden-badge"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      data-tooltip="숨김 메뉴"
    >
      <path d="M9.88 9.88a3 3 0 104.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 002 12s3 7 10 7a9.74 9.74 0 005.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function flatPermissions(nodes) {
  const result = [];
  for (const node of nodes) {
    if (!node.nodes || node.nodes.length === 0) {
      result.push(node);
    } else {
      result.push(...flatPermissions(node.nodes));
    }
  }
  return result;
}

export function buildAndFlattenMenus(menus) {
  const map = {};
  for (const m of menus) map[m.nodeId] = { ...m, nodes: [] };
  const roots = [];
  for (const m of menus) {
    if (m.parentId == null || !map[m.parentId]) {
      roots.push(map[m.nodeId]);
    } else {
      map[m.parentId].nodes.push(map[m.nodeId]);
    }
  }
  function flatten(nodes, depth) {
    const result = [];
    for (const node of nodes) {
      result.push({ nodeId: node.nodeId, title: node.title, restricted: node.restricted ?? false, depth });
      if (node.nodes.length > 0) result.push(...flatten(node.nodes, depth + 1));
    }
    return result;
  }
  return flatten(roots, 0);
}

export function MultiSelect({ items, selected, onToggle, placeholder, searchable = false }) {
  const [pos, setPos] = useState(null);
  const [q, setQ] = useState("");
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const open = pos !== null;

  function handleToggle() {
    if (open) {
      setPos(null);
      return;
    }
    const r = triggerRef.current.getBoundingClientRect();
    const PANEL_HEIGHT = 240; // search(~36) + list(200) + padding
    const spaceBelow = window.innerHeight - r.bottom;
    if (spaceBelow < PANEL_HEIGHT && r.top > spaceBelow) {
      setPos({ bottom: window.innerHeight - r.top + 4, left: r.left, width: r.width });
    } else {
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setPos(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const normalize = s => s.replace(/\s+/g, '').toLowerCase();
  const filtered = searchable && q
    ? items.filter(i => normalize(i.label).includes(normalize(q)))
    : items;

  const selectedCount = selected.length;

  return (
    <div class="edit-ms">
      <button type="button" class="edit-ms-trigger" ref={triggerRef} onClick={handleToggle}>
        <span class="edit-ms-value">
          {selectedCount > 0 ? `${selectedCount}개 선택됨` : placeholder}
        </span>
        <span class="edit-ms-caret">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          class="edit-ms-panel"
          ref={panelRef}
          style={{
            top: pos.top != null ? pos.top + "px" : undefined,
            bottom: pos.bottom != null ? pos.bottom + "px" : undefined,
            left: pos.left + "px",
            width: pos.width + "px",
          }}
        >
          {searchable && (
            <input
              class="edit-ms-search"
              placeholder="검색"
              value={q}
              onInput={e => setQ(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          )}
          <div class="edit-ms-list">
            {filtered.map(item => (
              <label
                key={item.value}
                class={`edit-ms-item${item.disabled ? " is-disabled" : ""}`}
                style={item.depth ? { paddingLeft: `${10 + item.depth * 12}px` } : undefined}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(item.value)}
                  onChange={() => !item.disabled && onToggle(item.value)}
                  disabled={item.disabled}
                />
                <span>{item.label}</span>
                {item.hidden && <HiddenBadge />}
              </label>
            ))}
            {filtered.length === 0 && (
              <div class="edit-ms-empty">결과 없음</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
