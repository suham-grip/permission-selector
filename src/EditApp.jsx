import { useState, useMemo, useEffect, useRef } from "preact/hooks";
import MENUS_DATA from "./data/menus.json";
import { HELP_TEXTS } from "./data/helpTexts.js";
import { SHORTCUTS } from "./data/shortcuts.js";
import { GLOSSARY } from "./data/glossary.js";
import "./styles/edit.css";

function HiddenBadge() {
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

function flatPermissions(nodes) {
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

// 현재 선택된 대상 메뉴(self + sc.menus + 이미 선택한 연쇄 키워드가 끌어오는 메뉴) 기준 키워드 옵션 목록
function getCascadeOptions(sc, selfSeq, extraMenuSeqs, getShortcuts, menuNameMap) {
  const options = [];
  const seen = new Set();
  const selfChipKey = `${selfSeq}:${sc.label}`;
  const candidateSeqs = new Set([selfSeq, ...sc.menus, ...extraMenuSeqs]);
  for (const seq of candidateSeqs) {
    const menuName = menuNameMap[seq] ?? String(seq);
    for (const tsc of getShortcuts(seq)) {
      if (!tsc.label.trim()) continue;
      const chipKey = `${seq}:${tsc.label}`;
      if (chipKey === selfChipKey) continue;
      if (seen.has(chipKey)) continue;
      seen.add(chipKey);
      const displayLabel = `${menuName} · ${tsc.label}`;
      options.push({ value: chipKey, label: displayLabel });
    }
  }
  return options;
}

function buildPermToMenus(menus) {
  const map = {};
  for (const menu of menus) {
    for (const code of menu.scopeRefs ?? []) {
      if (!map[code]) map[code] = [];
      map[code].push(menu);
    }
  }
  return map;
}

function buildAndFlattenMenus(menus) {
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

function MultiSelect({ items, selected, onToggle, placeholder, searchable = false }) {
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

export default function EditApp({ onExit }) {
  const [tab, setTab] = useState(
    () => sessionStorage.getItem("edit_tab") || "helptexts"
  );

  // menudescs tab state
  const [dirtyMenuDescs, setDirtyMenuDescs] = useState({});
  const [selectedDescMenuSeq, setSelectedDescMenuSeq] = useState(
    () => sessionStorage.getItem("edit_selectedDescMenuSeq") || null
  );
  const [menuDescSearch, setMenuDescSearch] = useState("");
  const [onlyMissingDesc, setOnlyMissingDesc] = useState(false);

  // helpTexts tab state
  const allLeaves = useMemo(() => flatPermissions(MENUS_DATA.permissions), []);
  const permToMenus = useMemo(() => buildPermToMenus(MENUS_DATA.menus), []);
  const [dirty, setDirty] = useState({ permissions: {}, permissionNames: {}, menuOverrides: {} });
  const [selectedCode, setSelectedCode] = useState(
    () => sessionStorage.getItem("edit_selectedCode") || null,
  );
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);

  // glossary tab state
  const [dirtyGlossary, setDirtyGlossary] = useState({});
  const [selectedTerm, setSelectedTerm] = useState(
    () => sessionStorage.getItem("edit_selectedTerm") || null,
  );
  const [glossarySearch, setGlossarySearch] = useState("");
  const [newTermDraft, setNewTermDraft] = useState("");

  // shortcuts tab state
  const allMenusFlat = useMemo(() => buildAndFlattenMenus(MENUS_DATA.menus), []);
  const allMenuItems = useMemo(
    () => allMenusFlat.map(m => ({ value: m.nodeId, label: m.title, depth: m.depth, hidden: m.restricted })),
    [allMenusFlat],
  );
  const menuNameMap = useMemo(() => {
    const m = {};
    for (const menu of MENUS_DATA.menus) m[menu.nodeId] = menu.title;
    return m;
  }, []);
  const allPermItems = useMemo(
    () => allLeaves.map(l => ({
      value: l.code,
      label: HELP_TEXTS.permissionNames?.[l.code] ?? l.label ?? l.code,
    })),
    [allLeaves],
  );

  const [dirtyShortcuts, setDirtyShortcuts] = useState({});
  const [selectedMenuSeq, setSelectedMenuSeq] = useState(
    () => sessionStorage.getItem("edit_selectedMenuSeq") || null
  );
  const [menuSearch, setMenuSearch] = useState("");

  const menuSeqToPermCodes = useMemo(() => {
    const m = {};
    for (const menu of MENUS_DATA.menus) m[menu.nodeId] = menu.scopeRefs ?? [];
    return m;
  }, []);

  function getPermItemsForShortcut(sc) {
    const seqs = new Set([...(selectedMenuSeq ? [selectedMenuSeq] : []), ...sc.menus]);
    const codes = new Set();
    for (const seq of seqs) {
      for (const code of menuSeqToPermCodes[seq] ?? []) codes.add(code);
    }
    return allPermItems.filter(p => codes.has(p.value));
  }

  // save state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("edit_tab", tab);
  }, [tab]);

  useEffect(() => {
    if (selectedCode) sessionStorage.setItem("edit_selectedCode", selectedCode);
    else sessionStorage.removeItem("edit_selectedCode");
  }, [selectedCode]);

  useEffect(() => {
    if (selectedMenuSeq != null) sessionStorage.setItem("edit_selectedMenuSeq", String(selectedMenuSeq));
    else sessionStorage.removeItem("edit_selectedMenuSeq");
  }, [selectedMenuSeq]);

  useEffect(() => {
    if (selectedDescMenuSeq != null) sessionStorage.setItem("edit_selectedDescMenuSeq", String(selectedDescMenuSeq));
    else sessionStorage.removeItem("edit_selectedDescMenuSeq");
  }, [selectedDescMenuSeq]);

  useEffect(() => {
    if (selectedTerm) sessionStorage.setItem("edit_selectedTerm", selectedTerm);
    else sessionStorage.removeItem("edit_selectedTerm");
  }, [selectedTerm]);

  const isDirtyHelpTexts =
    Object.keys(dirty.permissions).length > 0 ||
    Object.keys(dirty.permissionNames).length > 0 ||
    Object.keys(dirty.menuOverrides).length > 0;
  const isDirtyShortcuts = Object.keys(dirtyShortcuts).length > 0;
  const isDirtyMenuDescs = Object.keys(dirtyMenuDescs).length > 0;
  const isDirtyGlossary = Object.keys(dirtyGlossary).length > 0;
  const isDirty = isDirtyHelpTexts || isDirtyShortcuts || isDirtyMenuDescs || isDirtyGlossary;

  useEffect(() => {
    function onBeforeUnload(e) {
      if (isDirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // helpTexts helpers
  function currentBase(code) {
    if (code in dirty.permissions) return dirty.permissions[code] ?? "";
    return (
      HELP_TEXTS.permissions[code] ??
      allLeaves.find(l => l.code === code)?.helpText ??
      ""
    );
  }

  function currentMenuOverride(menuSeq, code) {
    const menuDirty = dirty.menuOverrides[menuSeq];
    if (menuDirty && code in menuDirty) return menuDirty[code] ?? "";
    return (
      HELP_TEXTS.menuOverrides[String(menuSeq)]?.[code] ??
      MENUS_DATA.menus.find(m => m.nodeId === menuSeq)?.permissionHelpText?.[code] ??
      ""
    );
  }

  function onBaseChange(code, val) {
    setDirty(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [code]: val },
    }));
  }

  function currentPermName(code) {
    if (code in dirty.permissionNames) return dirty.permissionNames[code] ?? "";
    return (
      HELP_TEXTS.permissionNames?.[code] ??
      allLeaves.find(l => l.code === code)?.label ??
      code
    );
  }

  function onPermNameChange(code, val) {
    setDirty(prev => ({
      ...prev,
      permissionNames: { ...prev.permissionNames, [code]: val },
    }));
  }

  function onMenuOverrideChange(menuSeq, code, val) {
    setDirty(prev => ({
      ...prev,
      menuOverrides: {
        ...prev.menuOverrides,
        [menuSeq]: { ...(prev.menuOverrides[menuSeq] ?? {}), [code]: val },
      },
    }));
  }

  // menuDescs helpers
  function currentMenuDesc(menuSeq) {
    const key = String(menuSeq);
    if (key in dirtyMenuDescs) return dirtyMenuDescs[key] ?? "";
    if (HELP_TEXTS.menuDescriptions && key in HELP_TEXTS.menuDescriptions)
      return HELP_TEXTS.menuDescriptions[key];
    return MENUS_DATA.menus.find(m => m.nodeId === menuSeq)?.label ?? "";
  }

  function onMenuDescChange(menuSeq, val) {
    setDirtyMenuDescs(prev => ({ ...prev, [String(menuSeq)]: val }));
  }

  // glossary helpers
  function currentGlossaryDesc(term) {
    if (term in dirtyGlossary) return dirtyGlossary[term];
    return GLOSSARY[term] ?? null;
  }

  function onGlossaryDescChange(term, val) {
    setDirtyGlossary(prev => ({ ...prev, [term]: val }));
  }

  function addGlossaryTerm() {
    const term = newTermDraft.trim();
    if (!term || currentGlossaryDesc(term) != null) return;
    setDirtyGlossary(prev => ({ ...prev, [term]: "" }));
    setSelectedTerm(term);
    setNewTermDraft("");
  }

  function deleteGlossaryTerm(term) {
    setDirtyGlossary(prev => ({ ...prev, [term]: null }));
    if (selectedTerm === term) setSelectedTerm(null);
  }

  // shortcuts helpers
  function currentShortcuts(menuSeq) {
    const key = String(menuSeq);
    if (key in dirtyShortcuts) return dirtyShortcuts[key];
    return SHORTCUTS[key] ?? [];
  }

  function updateShortcuts(menuSeq, shortcuts) {
    setDirtyShortcuts(prev => ({ ...prev, [String(menuSeq)]: shortcuts }));
  }

  function addKeyword() {
    const current = currentShortcuts(selectedMenuSeq);
    updateShortcuts(selectedMenuSeq, [...current, { label: "", desc: "", menus: [], perms: [] }]);
  }

  function updateKeyword(idx, newSc) {
    const current = currentShortcuts(selectedMenuSeq);
    const oldSc = current[idx];
    const updatedCurrent = current.map((s, i) => i === idx ? newSc : s);

    const newDirty = { ...dirtyShortcuts, [String(selectedMenuSeq)]: updatedCurrent };

    // label 변경 시: cascade로 참조하는 모든 키워드(현재 메뉴 포함)의 값을 일괄 교체
    if (oldSc.label !== newSc.label && oldSc.label.trim()) {
      const oldKey = `${selectedMenuSeq}:${oldSc.label}`;
      const newKey = `${selectedMenuSeq}:${newSc.label}`;
      for (const menu of MENUS_DATA.menus) {
        const seq = String(menu.nodeId);
        const scs = seq in newDirty ? newDirty[seq] : (SHORTCUTS[seq] ?? []);
        if (!scs.some(s => s.cascades?.includes(oldKey))) continue;
        newDirty[seq] = scs.map(s => {
          if (!s.cascades?.includes(oldKey)) return s;
          return { ...s, cascades: s.cascades.map(ck => ck === oldKey ? newKey : ck) };
        });
      }
    }

    setDirtyShortcuts(newDirty);
  }

  function deleteKeyword(idx) {
    const current = currentShortcuts(selectedMenuSeq);
    const sc = current[idx];
    const updatedCurrent = current.filter((_, i) => i !== idx);

    const newDirty = { ...dirtyShortcuts, [String(selectedMenuSeq)]: updatedCurrent };

    // 삭제 시: 이 키워드를 cascade로 참조하는 모든 키워드(현재 메뉴 포함)의 참조를 제거
    if (sc.label.trim()) {
      const chipKey = `${selectedMenuSeq}:${sc.label}`;
      for (const menu of MENUS_DATA.menus) {
        const seq = String(menu.nodeId);
        const scs = seq in newDirty ? newDirty[seq] : (SHORTCUTS[seq] ?? []);
        if (!scs.some(s => s.cascades?.includes(chipKey))) continue;
        newDirty[seq] = scs.map(s => {
          if (!s.cascades?.includes(chipKey)) return s;
          return { ...s, cascades: s.cascades.filter(ck => ck !== chipKey) };
        });
      }
    }

    setDirtyShortcuts(newDirty);
  }

  // save
  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);

    try {
      if (tab === "menudescs") {
        const fullMenuDescriptions = { ...(HELP_TEXTS.menuDescriptions ?? {}) };
        for (const [seq, v] of Object.entries(dirtyMenuDescs)) {
          const trimmed = v.trim();
          // 빈 문자열도 명시 저장 — 삭제하면 menus.js의 description으로 폴백됨
          fullMenuDescriptions[seq] = trimmed;
        }
        const res = await fetch("/__write-help-texts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            permissions: HELP_TEXTS.permissions,
            permissionNames: HELP_TEXTS.permissionNames,
            menuOverrides: HELP_TEXTS.menuOverrides,
            menuDescriptions: fullMenuDescriptions,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error);
        }
        HELP_TEXTS.menuDescriptions = fullMenuDescriptions;
        setDirtyMenuDescs({});
      } else if (tab === "helptexts") {
        const fullPermissions = { ...HELP_TEXTS.permissions };
        for (const [k, v] of Object.entries(dirty.permissions)) {
          const trimmed = v.trim();
          if (trimmed === "") delete fullPermissions[k];
          else fullPermissions[k] = trimmed;
        }
        const fullPermissionNames = { ...(HELP_TEXTS.permissionNames ?? {}) };
        for (const [k, v] of Object.entries(dirty.permissionNames)) {
          const trimmed = v.trim();
          if (trimmed === "") delete fullPermissionNames[k];
          else fullPermissionNames[k] = trimmed;
        }
        const fullMenuOverrides = {};
        for (const [seq, overrides] of Object.entries(HELP_TEXTS.menuOverrides)) {
          fullMenuOverrides[seq] = { ...overrides };
        }
        for (const [menuSeq, overrides] of Object.entries(dirty.menuOverrides)) {
          if (!fullMenuOverrides[menuSeq]) fullMenuOverrides[menuSeq] = {};
          for (const [code, v] of Object.entries(overrides)) {
            const trimmed = v.trim();
            if (trimmed === "") delete fullMenuOverrides[menuSeq][code];
            else fullMenuOverrides[menuSeq][code] = trimmed;
          }
          if (Object.keys(fullMenuOverrides[menuSeq]).length === 0) {
            delete fullMenuOverrides[menuSeq];
          }
        }
        const res = await fetch("/__write-help-texts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            permissions: fullPermissions,
            permissionNames: fullPermissionNames,
            menuOverrides: fullMenuOverrides,
            menuDescriptions: HELP_TEXTS.menuDescriptions ?? {},
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error);
        }
        HELP_TEXTS.permissions = fullPermissions;
        HELP_TEXTS.permissionNames = fullPermissionNames;
        HELP_TEXTS.menuOverrides = fullMenuOverrides;
        setDirty({ permissions: {}, permissionNames: {}, menuOverrides: {} });
      } else if (tab === "glossary") {
        const fullGlossary = { ...GLOSSARY };
        for (const [term, desc] of Object.entries(dirtyGlossary)) {
          if (desc == null) delete fullGlossary[term];
          else fullGlossary[term] = desc.trim();
        }
        const res = await fetch("/__write-glossary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullGlossary),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error);
        }
        for (const key of Object.keys(GLOSSARY)) delete GLOSSARY[key];
        for (const [key, val] of Object.entries(fullGlossary)) GLOSSARY[key] = val;
        setDirtyGlossary({});
      } else {
        const fullShortcuts = { ...SHORTCUTS };
        for (const [seq, shortcuts] of Object.entries(dirtyShortcuts)) {
          const valid = shortcuts
            .filter(s => s.label.trim())
            .map(s => {
              const entry = { label: s.label.trim(), menus: s.menus, perms: s.perms };
              if (s.desc && s.desc.trim()) entry.desc = s.desc.trim();
              if (s.cascades && s.cascades.length > 0) entry.cascades = s.cascades;
              return entry;
            });
          if (valid.length === 0) delete fullShortcuts[seq];
          else fullShortcuts[seq] = valid;
        }
        const res = await fetch("/__write-shortcuts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullShortcuts),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error);
        }
        // 메모리 내 SHORTCUTS 동기화 (parseMenus가 최신 값을 사용하도록)
        for (const key of Object.keys(SHORTCUTS)) delete SHORTCUTS[key];
        for (const [seq, scs] of Object.entries(fullShortcuts)) SHORTCUTS[seq] = scs;
        setDirtyShortcuts({});
      }
      setSaveMsg({ type: "ok", text: "저장되었습니다" });
    } catch (e) {
      setSaveMsg({ type: "err", text: String(e) });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  const normalize = s => s.replace(/\s+/g, '').toLowerCase();

  // helptexts tab filtered list
  const filtered = useMemo(() => {
    let list = allLeaves;
    if (search.trim()) {
      const q = normalize(search.trim());
      list = list.filter(
        l =>
          normalize(currentPermName(l.code)).includes(q) ||
          normalize(l.code).includes(q),
      );
    }
    if (onlyMissing) {
      list = list.filter(l => !currentBase(l.code));
    }
    return list;
  }, [allLeaves, search, onlyMissing, dirty.permissions, dirty.permissionNames]);

  // shortcuts tab filtered menu list
  const filteredMenusFlat = useMemo(() => {
    if (!menuSearch.trim()) return allMenusFlat;
    const q = normalize(menuSearch.trim());
    return allMenusFlat.filter(m => {
      if (normalize(m.title).includes(q)) return true;
      return currentShortcuts(m.nodeId).some(s => normalize(s.label).includes(q));
    });
  }, [allMenusFlat, menuSearch, dirtyShortcuts]);

  const selectedLeaf = selectedCode ? allLeaves.find(l => l.code === selectedCode) : null;
  const selectedMenus = selectedCode ? (permToMenus[selectedCode] ?? []) : [];
  const selectedMenuName = selectedMenuSeq
    ? MENUS_DATA.menus.find(m => m.nodeId === selectedMenuSeq)?.title ?? ""
    : "";

  // glossary tab filtered list
  const filteredGlossaryTerms = useMemo(() => {
    const set = new Set(Object.keys(GLOSSARY));
    for (const k of Object.keys(dirtyGlossary)) set.add(k);
    let list = [...set].filter(term => currentGlossaryDesc(term) != null);
    if (glossarySearch.trim()) {
      const q = normalize(glossarySearch.trim());
      list = list.filter(
        term =>
          normalize(term).includes(q) ||
          normalize(currentGlossaryDesc(term) ?? '').includes(q),
      );
    }
    return list.sort((a, b) => a.localeCompare(b, "ko"));
  }, [dirtyGlossary, glossarySearch]);

  const currentTabIsDirty =
    tab === "helptexts" ? isDirtyHelpTexts :
    tab === "shortcuts" ? isDirtyShortcuts :
    tab === "glossary" ? isDirtyGlossary :
    isDirtyMenuDescs;

  return (
    <div class="edit-app">
      <header class="edit-header">
        <span class="edit-header-badge">DEV</span>
        <div class="edit-tabs">
          <button
            class={`edit-tab${tab === "helptexts" ? " is-active" : ""}`}
            onClick={() => setTab("helptexts")}
          >
            권한 설명
            {isDirtyHelpTexts && <span class="edit-tab-dot" />}
          </button>
          <button
            class={`edit-tab${tab === "shortcuts" ? " is-active" : ""}`}
            onClick={() => setTab("shortcuts")}
          >
            키워드 묶음
            {isDirtyShortcuts && <span class="edit-tab-dot" />}
          </button>
          <button
            class={`edit-tab${tab === "menudescs" ? " is-active" : ""}`}
            onClick={() => setTab("menudescs")}
          >
            메뉴 설명
            {isDirtyMenuDescs && <span class="edit-tab-dot" />}
          </button>
          <button
            class={`edit-tab${tab === "glossary" ? " is-active" : ""}`}
            onClick={() => setTab("glossary")}
          >
            용어 사전
            {isDirtyGlossary && <span class="edit-tab-dot" />}
          </button>
        </div>
        {saveMsg && (
          <span style={{ fontSize: "12px", color: saveMsg.type === "ok" ? "var(--success)" : "var(--danger)" }}>
            {saveMsg.text}
          </span>
        )}
        {isDirty && !saveMsg && (
          <span class="edit-header-dirty">미저장 변경 있음</span>
        )}
        <button class="edit-save-btn" onClick={handleSave} disabled={!currentTabIsDirty || saving}>
          {saving ? "저장 중…" : "저장"}
        </button>
        <button class="edit-exit-btn" onClick={onExit}>
          ← 돌아가기
        </button>
      </header>

      {tab === "helptexts" ? (
        <div class="edit-body">
          <div class="edit-list-col">
            <div class="edit-list-top">
              <input
                class="edit-list-search"
                type="text"
                placeholder="권한 이름 또는 코드 검색"
                value={search}
                onInput={e => setSearch(e.target.value)}
              />
              <label class="edit-list-filter">
                <input
                  type="checkbox"
                  checked={onlyMissing}
                  onChange={e => setOnlyMissing(e.target.checked)}
                />
                설명 미작성만 보기
              </label>
            </div>
            <div class="edit-list-scroll">
              {filtered.map(leaf => {
                const hasText = !!currentBase(leaf.code);
                return (
                  <div
                    key={leaf.code}
                    class={`edit-perm-row${selectedCode === leaf.code ? " is-active" : ""}`}
                    onClick={() => setSelectedCode(leaf.code)}
                  >
                    <span class={`edit-perm-dot${hasText ? " has-text" : ""}`} />
                    <span class="edit-perm-name">{currentPermName(leaf.code)}</span>
                    <span class="edit-perm-code">{leaf.code.slice(0, 10)}</span>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ padding: "20px 14px", fontSize: "13px", color: "var(--text-faint)" }}>
                  결과 없음
                </div>
              )}
            </div>
          </div>

          <div class="edit-form-col">
            {!selectedLeaf ? (
              <div class="edit-form-empty">
                좌측에서 권한을 선택하면 설명을 편집할 수 있습니다.
              </div>
            ) : (
              <>
                <p class="edit-form-title">{currentPermName(selectedCode)}</p>
                <p class="edit-form-code">{selectedLeaf.code}</p>

                <div class="edit-field">
                  <label class="edit-field-label">권한 이름</label>
                  <span class="edit-field-sub">
                    상세 권한 카드에 표시되는 이름이에요. <code>[[용어]]</code>로 태그하면
                    카드에서도 밑줄 표시되고, hover 시 뜨는 도움말 박스 하단에 용어 설명이 붙어요.
                  </span>
                  <input
                    class="edit-textarea"
                    style={{ minHeight: "auto" }}
                    value={currentPermName(selectedCode)}
                    onInput={e => onPermNameChange(selectedCode, e.target.value)}
                  />
                </div>

                <hr class="edit-section-divider" />

                <div class="edit-field">
                  <label class="edit-field-label">기본 설명 (base helpText)</label>
                  <span class="edit-field-sub">어느 메뉴에서 보든 공통으로 표시되는 설명이에요.</span>
                  <textarea
                    class="edit-textarea"
                    placeholder="이 권한이 무엇을 허용하는지 한두 문장으로 설명해 주세요."
                    value={currentBase(selectedCode)}
                    onInput={e => onBaseChange(selectedCode, e.target.value)}
                  />
                </div>

                {selectedMenus.length > 0 && (
                  <>
                    <hr class="edit-section-divider" />
                    <div class="edit-field-label" style={{ marginBottom: "6px" }}>
                      메뉴별 추가 설명 (permissionHelpText)
                    </div>
                    <span class="edit-field-sub" style={{ display: "block", marginBottom: "16px" }}>
                      해당 메뉴를 포커스했을 때 기본 설명 아래에 추가로 표시돼요.
                    </span>
                    {selectedMenus.map(menu => (
                      <div key={menu.nodeId} class="edit-menu-group">
                        <div class="edit-menu-group-label">
                          {menu.title}
                          {menu.restricted && <span class="edit-menu-hidden-tag">hidden</span>}
                        </div>
                        <textarea
                          class="edit-textarea"
                          placeholder={`${menu.title} 페이지에서만 보이는 추가 설명`}
                          value={currentMenuOverride(menu.nodeId, selectedCode)}
                          onInput={e => onMenuOverrideChange(menu.nodeId, selectedCode, e.target.value)}
                        />
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : tab === "shortcuts" ? (
        <div class="edit-body">
          <div class="edit-list-col">
            <div class="edit-list-top">
              <input
                class="edit-list-search"
                type="text"
                placeholder="메뉴 검색"
                value={menuSearch}
                onInput={e => setMenuSearch(e.target.value)}
              />
            </div>
            <div class="edit-list-scroll">
              {filteredMenusFlat.map(m => {
                const shortcuts = currentShortcuts(m.nodeId);
                const count = shortcuts.filter(s => s.label.trim()).length;
                return (
                  <div
                    key={m.nodeId}
                    class={`edit-perm-row${selectedMenuSeq === m.nodeId ? " is-active" : ""}`}
                    style={{ paddingLeft: `${14 + m.depth * 14}px` }}
                    onClick={() => setSelectedMenuSeq(m.nodeId)}
                  >
                    <span class={`edit-perm-dot${count > 0 ? " has-text" : ""}`} />
                    <span class="edit-perm-name">{m.title}</span>
                    {m.restricted && <HiddenBadge />}
                    {count > 0 && <span class="edit-sc-count">{count}개</span>}
                  </div>
                );
              })}
              {filteredMenusFlat.length === 0 && (
                <div style={{ padding: "20px 14px", fontSize: "13px", color: "var(--text-faint)" }}>
                  결과 없음
                </div>
              )}
            </div>
          </div>

          <div class="edit-form-col">
            {selectedMenuSeq == null ? (
              <div class="edit-form-empty">
                좌측에서 메뉴를 선택하면 키워드를 편집할 수 있습니다.
              </div>
            ) : (
              <>
                <p class="edit-form-title">{selectedMenuName}</p>
                <button class="edit-sc-add-btn" onClick={addKeyword}>
                  + 키워드 추가
                </button>

                {currentShortcuts(selectedMenuSeq).length === 0 && (
                  <div style={{ color: "var(--text-faint)", fontSize: "13px", marginTop: "20px" }}>
                    아직 키워드가 없습니다. 위 버튼으로 추가해 주세요.
                  </div>
                )}

                <div class="edit-sc-list">
                {currentShortcuts(selectedMenuSeq).map((sc, i) => {
                  // 연쇄 키워드에서 파생된 locked menus/perms 계산
                  const cascadeMenusSet = new Set();
                  const cascadePermsSet = new Set();
                  const visited = new Set([`${selectedMenuSeq}:${sc.label}`]);
                  const queue = [...(sc.cascades ?? [])];
                  while (queue.length > 0) {
                    const chipKey = queue.shift();
                    if (visited.has(chipKey)) continue;
                    visited.add(chipKey);
                    const colonIdx = chipKey.indexOf(':');
                    if (colonIdx === -1) continue;
                    const seq = chipKey.slice(0, colonIdx);
                    const label = chipKey.slice(colonIdx + 1);
                    const cascadeSc = currentShortcuts(seq).find(s => s.label === label);
                    if (!cascadeSc) continue;
                    for (const m of cascadeSc.menus) cascadeMenusSet.add(m);
                    for (const p of cascadeSc.perms) cascadePermsSet.add(p);
                    for (const nextKey of (cascadeSc.cascades ?? [])) {
                      if (!visited.has(nextKey)) queue.push(nextKey);
                    }
                  }
                  const lockedMenus = [...cascadeMenusSet].filter(m => !sc.menus.includes(m));
                  const lockedPerms = [...cascadePermsSet].filter(p => !sc.perms.includes(p));

                  // 대상 권한 items: 기존 + locked perm 항목(disabled)
                  const ownPermItems = getPermItemsForShortcut(sc);
                  const ownPermValues = new Set(ownPermItems.map(p => p.value));
                  const lockedMenuPermCodes = new Set();
                  for (const seq of lockedMenus) {
                    for (const code of menuSeqToPermCodes[seq] ?? []) lockedMenuPermCodes.add(code);
                  }
                  const mergedPermItems = [
                    ...ownPermItems.map(item =>
                      lockedPerms.includes(item.value)
                        ? { ...item, disabled: true }
                        : item
                    ),
                    ...allPermItems
                      .filter(item =>
                        (lockedPerms.includes(item.value) || lockedMenuPermCodes.has(item.value))
                        && !ownPermValues.has(item.value)
                      )
                      .map(item => ({ ...item, disabled: lockedPerms.includes(item.value) })),
                  ];

                  return (
                  <div key={i} class="edit-sc-card">
                    <div class="edit-sc-card-header">
                      <input
                        class="edit-sc-label-input"
                        placeholder="키워드 이름 (예: 조회)"
                        value={sc.label}
                        onInput={e => updateKeyword(i, { ...sc, label: e.target.value })}
                      />
                      <button class="edit-sc-delete-btn" onClick={() => deleteKeyword(i)}>
                        삭제
                      </button>
                    </div>
                    <div class="edit-sc-desc-row">
                      <textarea
                        class="edit-sc-desc-input"
                        placeholder="키워드 설명 (칩 hover 시 표시)"
                        value={sc.desc ?? ""}
                        onInput={e => updateKeyword(i, { ...sc, desc: e.target.value })}
                      />
                    </div>
                    <div class="edit-sc-field">
                      <span class="edit-sc-field-label">대상 메뉴</span>
                      <MultiSelect
                        items={allMenuItems.map(item =>
                          item.value === selectedMenuSeq || lockedMenus.includes(item.value)
                            ? { ...item, disabled: true }
                            : item
                        )}
                        selected={[...sc.menus, ...lockedMenus]}
                        onToggle={v => {
                          const next = sc.menus.includes(v)
                            ? sc.menus.filter(x => x !== v)
                            : [...sc.menus, v];
                          updateKeyword(i, { ...sc, menus: next });
                        }}
                        placeholder="메뉴 선택"
                        searchable
                      />
                    </div>
                    <div class="edit-sc-field">
                      <span class="edit-sc-field-label">대상 권한</span>
                      <MultiSelect
                        items={mergedPermItems}
                        selected={[...sc.perms, ...lockedPerms]}
                        onToggle={v => {
                          const next = sc.perms.includes(v)
                            ? sc.perms.filter(x => x !== v)
                            : [...sc.perms, v];
                          updateKeyword(i, { ...sc, perms: next });
                        }}
                        placeholder="권한 선택"
                        searchable
                      />
                    </div>
                    {(() => {
                      const cascadeOptions = getCascadeOptions(sc, selectedMenuSeq, cascadeMenusSet, currentShortcuts, menuNameMap);
                      if (!cascadeOptions.length) return null;
                      const selectedCascades = sc.cascades ?? [];
                      return (
                        <div class="edit-sc-field edit-sc-cascade-field">
                          <span class="edit-sc-field-label">연쇄 키워드</span>
                          <span class="edit-sc-cascade-hint">이 키워드 활성 시 함께 켜질 대상 메뉴의 키워드를 선택하세요.</span>
                          <MultiSelect
                            items={cascadeOptions}
                            selected={selectedCascades}
                            onToggle={v => {
                              const next = selectedCascades.includes(v)
                                ? selectedCascades.filter(x => x !== v)
                                : [...selectedCascades, v];
                              updateKeyword(i, { ...sc, cascades: next });
                            }}
                            placeholder="연쇄할 키워드 선택"
                          />
                        </div>
                      );
                    })()}
                  </div>
                  );
                })}
                </div>
              </>
            )}
          </div>
        </div>
      ) : tab === "menudescs" ? (
        <MenuDescsTab
          allMenusFlat={allMenusFlat}
          currentMenuDesc={currentMenuDesc}
          onMenuDescChange={onMenuDescChange}
          search={menuDescSearch}
          setSearch={setMenuDescSearch}
          onlyMissing={onlyMissingDesc}
          setOnlyMissing={setOnlyMissingDesc}
          selectedMenuSeq={selectedDescMenuSeq}
          setSelectedMenuSeq={setSelectedDescMenuSeq}
        />
      ) : tab === "glossary" ? (
        <div class="edit-body">
          <div class="edit-list-col">
            <div class="edit-list-top">
              <input
                class="edit-list-search"
                type="text"
                placeholder="용어 검색"
                value={glossarySearch}
                onInput={e => setGlossarySearch(e.target.value)}
              />
              <div class="edit-glossary-add-row">
                <input
                  class="edit-glossary-add-input"
                  type="text"
                  placeholder="새 용어 (예: 마스킹 해제)"
                  value={newTermDraft}
                  onInput={e => setNewTermDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) {
                      e.preventDefault();
                      addGlossaryTerm();
                    }
                  }}
                />
                <button
                  class="edit-glossary-add-btn"
                  onClick={addGlossaryTerm}
                  disabled={
                    !newTermDraft.trim() ||
                    currentGlossaryDesc(newTermDraft.trim()) != null
                  }
                >
                  + 추가
                </button>
              </div>
            </div>
            <div class="edit-list-scroll">
              {filteredGlossaryTerms.map(term => {
                const hasText = !!currentGlossaryDesc(term);
                return (
                  <div
                    key={term}
                    class={`edit-perm-row${selectedTerm === term ? " is-active" : ""}`}
                    onClick={() => setSelectedTerm(term)}
                  >
                    <span class={`edit-perm-dot${hasText ? " has-text" : ""}`} />
                    <span class="edit-perm-name">{term}</span>
                  </div>
                );
              })}
              {filteredGlossaryTerms.length === 0 && (
                <div style={{ padding: "20px 14px", fontSize: "13px", color: "var(--text-faint)" }}>
                  결과 없음
                </div>
              )}
            </div>
          </div>

          <div class="edit-form-col">
            {!selectedTerm || currentGlossaryDesc(selectedTerm) == null ? (
              <div class="edit-form-empty">
                좌측에서 용어를 선택하거나, 새 용어를 추가해서 설명을 편집할 수 있습니다.
                <br />
                설명 텍스트 안에서 <code>[[{selectedTerm || "용어"}]]</code>로 태그하면
                해당 툴팁 하단에 이 설명이 자동으로 표시돼요.
              </div>
            ) : (
              <>
                <p class="edit-form-title">{selectedTerm}</p>
                <p class="edit-form-code">
                  본문에서 <code>[[{selectedTerm}]]</code> 로 태그하면 이 설명이 표시돼요.
                </p>

                <div class="edit-field">
                  <label class="edit-field-label">용어 설명</label>
                  <span class="edit-field-sub">
                    메뉴/권한 설명 툴팁 하단에 그대로 표시되는 문장이에요.
                  </span>
                  <textarea
                    class="edit-textarea"
                    placeholder="이 용어가 무엇을 의미하는지 한두 문장으로 설명해 주세요."
                    value={currentGlossaryDesc(selectedTerm) ?? ""}
                    onInput={e => onGlossaryDescChange(selectedTerm, e.target.value)}
                  />
                </div>

                <button
                  class="edit-sc-delete-btn"
                  style={{ marginTop: "12px" }}
                  onClick={() => deleteGlossaryTerm(selectedTerm)}
                >
                  이 용어 삭제
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuDescsTab({
  allMenusFlat,
  currentMenuDesc,
  onMenuDescChange,
  search,
  setSearch,
  onlyMissing,
  setOnlyMissing,
  selectedMenuSeq,
  setSelectedMenuSeq,
}) {
  const filtered = useMemo(() => {
    let list = allMenusFlat;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q));
    }
    if (onlyMissing) {
      list = list.filter(m => !currentMenuDesc(m.nodeId));
    }
    return list;
  }, [allMenusFlat, search, onlyMissing, currentMenuDesc]);

  const selectedMenu = selectedMenuSeq
    ? allMenusFlat.find(m => m.nodeId === selectedMenuSeq)
    : null;

  return (
    <div class="edit-body">
      <div class="edit-list-col">
        <div class="edit-list-top">
          <input
            class="edit-list-search"
            type="text"
            placeholder="메뉴 이름 검색"
            value={search}
            onInput={e => setSearch(e.target.value)}
          />
          <label class="edit-list-filter">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={e => setOnlyMissing(e.target.checked)}
            />
            설명 미작성만 보기
          </label>
        </div>
        <div class="edit-list-scroll">
          {filtered.map(m => {
            const hasText = !!currentMenuDesc(m.nodeId);
            return (
              <div
                key={m.nodeId}
                class={`edit-perm-row${selectedMenuSeq === m.nodeId ? " is-active" : ""}`}
                style={{ paddingLeft: `${14 + m.depth * 14}px` }}
                onClick={() => setSelectedMenuSeq(m.nodeId)}
              >
                <span class={`edit-perm-dot${hasText ? " has-text" : ""}`} />
                <span class="edit-perm-name">{m.title}</span>
                {m.restricted && <HiddenBadge />}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: "20px 14px", fontSize: "13px", color: "var(--text-faint)" }}>
              결과 없음
            </div>
          )}
        </div>
      </div>

      <div class="edit-form-col">
        {!selectedMenu ? (
          <div class="edit-form-empty">
            좌측에서 메뉴를 선택하면 설명을 편집할 수 있습니다.
          </div>
        ) : (
          <>
            <p class="edit-form-title">{selectedMenu.title}</p>
            <div class="edit-field">
              <label class="edit-field-label">메뉴 설명</label>
              <span class="edit-field-sub">해당 페이지가 어떤 기능을 하는지 짧게 설명해 주세요.</span>
              <textarea
                class="edit-textarea"
                placeholder="예) 그립 서비스를 이용하는 일반 사용자를 조회·관리하는 메뉴입니다."
                value={currentMenuDesc(selectedMenuSeq)}
                onInput={e => onMenuDescChange(selectedMenuSeq, e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
