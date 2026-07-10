import { useState, useMemo, useEffect } from "preact/hooks";
import { buildTree, isLeaf, computeOrphanPerms } from "../lib/tree.js";
import { stripGlossaryMarkers } from "../lib/glossary.jsx";
import { LockIcon } from "./icons.jsx";

function XIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path d="M2 2l8 8M10 2l-8 8" stroke-linecap="round" />
    </svg>
  );
}

// "권한 메뉴 없음" 섹션 — 선택된 메뉴 어디에도 속하지 않은 권한 목록.
// tree/split 두 뷰 모두 동일하게 노출해 orphan 상태를 놓치지 않도록 한다.
function OrphanSection({ orphanPerms, dispatch, showGap, permFilter }) {
  if (orphanPerms.length === 0) return null;
  return (
    <>
      {showGap && <div class="cart-tree-gap" />}
      <div class="cart-tree-row">
        <span class="cart-tree-orphan-label">권한 메뉴 없음</span>
      </div>
      {orphanPerms.map((p) => {
        const isFiltered = permFilter === p.permissionCode;
        return (
          <div
            key={p.permissionCode}
            class={`cart-tree-row cart-orphan-perm-row${isFiltered ? " is-focused" : ""}`}
            onClick={() =>
              dispatch({ type: "SET_PERM_FILTER", permCode: p.permissionCode })
            }
            data-tooltip={isFiltered ? "필터 해제" : "클릭하면 권한 메뉴가 필터링돼요"}
          >
            <span class="cart-tree-pre">{"  "}</span>
            <span class="cart-tree-perm-group">
              <span class="cart-tree-perm-label">{stripGlossaryMarkers(p.label)}</span>
              {p.requiresApproval && (
                <span class="cart-lock">
                  <LockIcon />
                </span>
              )}
            </span>
            <button
              class="cart-remove"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "TOGGLE_PERM", permCode: p.permissionCode });
              }}
              data-tooltip="선택 해제"
              aria-label={`${stripGlossaryMarkers(p.label)} 제거`}
            >
              <XIcon />
            </button>
          </div>
        );
      })}
    </>
  );
}

function buildTreeLines(menus, selectedMenuSeqs, selectedPermCodes) {
  const tree = buildTree(menus);
  const lines = [];

  function hasSelectedDescendant(node) {
    if (isLeaf(node)) return selectedMenuSeqs.has(node.nodeId);
    return (node.nodes || []).some(hasSelectedDescendant);
  }

  function walk(node, nodePre, isLast) {
    if (!hasSelectedDescendant(node)) return;
    const connector = isLast ? "└" : "├";
    const contChar = isLast ? " " : "│";
    const childPre = nodePre + contChar + "   ";

    if (isLeaf(node)) {
      if (!selectedMenuSeqs.has(node.nodeId)) return;
      const selPerms = node.permissions.filter((p) =>
        selectedPermCodes.has(p.permissionCode),
      );
      lines.push({
        type: "menu",
        pre: nodePre + connector + " ",
        name: node.title,
        nodeId: node.nodeId,
        noPermsSelected: node.permissions.length > 0 && selPerms.length === 0,
        permTotal: node.permissions.length,
        permSelected: selPerms.length,
      });
      selPerms.forEach((p) => {
        lines.push({
          type: "perm",
          pre: nodePre + contChar + "   ",
          perm: p,
          nodeId: node.nodeId,
        });
      });
    } else {
      lines.push({
        type: "branch",
        pre: nodePre + connector + " ",
        name: node.title,
      });
      const visible = (node.nodes || []).filter(hasSelectedDescendant);
      visible.forEach((child, i) =>
        walk(child, childPre, i === visible.length - 1),
      );
    }
  }

  const visibleRoots = tree.filter(hasSelectedDescendant);
  visibleRoots.forEach((root, i) => {
    if (isLeaf(root)) {
      if (selectedMenuSeqs.has(root.nodeId)) {
        const selPerms = root.permissions.filter((p) =>
          selectedPermCodes.has(p.permissionCode),
        );
        lines.push({
          type: "menu",
          pre: "",
          name: root.title,
          nodeId: root.nodeId,
          noPermsSelected: root.permissions.length > 0 && selPerms.length === 0,
          permTotal: root.permissions.length,
          permSelected: selPerms.length,
        });
        selPerms.forEach((p) => {
          lines.push({
            type: "perm",
            pre: "    ",
            perm: p,
            nodeId: root.nodeId,
          });
        });
      }
    } else {
      lines.push({ type: "root", name: root.title });
      const visible = (root.nodes || []).filter(hasSelectedDescendant);
      visible.forEach((child, j) =>
        walk(child, "  ", j === visible.length - 1),
      );
    }
    if (i < visibleRoots.length - 1) lines.push({ type: "gap" });
  });

  return lines;
}

export default function CartPanel({ state, dispatch, onCopyClick, addToast }) {
  const { menus, selectedMenuSeqs, selectedPermCodes, focusedMenuSeq } = state;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [collapsedMenuSeqs, setCollapsedMenuSeqs] = useState(new Set());
  const [viewMode, setViewMode] = useState("tree"); // 'tree' | 'split'

  // 메뉴 제거 시 소속 권한은 유지(orphan화)되는데, 이 사실을 모르면 사용자가
  // "권한이 남아있다"를 버그로 오인할 수 있어 제거 시점에 안내한다.
  function handleRemoveMenu(menuSeq) {
    const menu = menus.find((m) => m.nodeId === menuSeq);
    const keptPerms = (menu?.permissions ?? []).filter((p) =>
      selectedPermCodes.has(p.permissionCode),
    );
    dispatch({ type: "TOGGLE_MENU", menuSeq });
    if (keptPerms.length > 0 && addToast) {
      addToast(
        "info",
        `메뉴는 해제됐지만 선택했던 상세 권한 ${keptPerms.length}개는 유지돼요`,
      );
    }
  }

  function togglePermExpand(menuSeq, e) {
    e.stopPropagation();
    setCollapsedMenuSeqs((prev) => {
      const next = new Set(prev);
      if (next.has(menuSeq)) {
        next.delete(menuSeq); // 접혀 있던 것 펼치기
      } else {
        next.add(menuSeq); // 펼쳐 있던 것 접기
      }
      return next;
    });
  }

  const lines = useMemo(
    () => buildTreeLines(menus, selectedMenuSeqs, selectedPermCodes),
    [menus, selectedMenuSeqs, selectedPermCodes],
  );

  const orphanPerms = useMemo(
    () => computeOrphanPerms(menus, selectedMenuSeqs, selectedPermCodes),
    [menus, selectedMenuSeqs, selectedPermCodes],
  );

  const menuCount = lines.filter((l) => l.type === "menu").length;
  const permCount = selectedPermCodes.size;
  const isEmpty = lines.length === 0 && orphanPerms.length === 0;

  // orphan은 별도 섹션(OrphanSection)에서 표시하므로 여기서는 제외
  const dedupedPerms = useMemo(() => {
    if (viewMode !== "split") return [];
    const map = {};
    for (const menu of menus) {
      if (!selectedMenuSeqs.has(menu.nodeId)) continue;
      for (const p of menu.permissions ?? []) {
        if (selectedPermCodes.has(p.permissionCode) && !map[p.permissionCode]) {
          map[p.permissionCode] = p;
        }
      }
    }
    return Object.values(map);
  }, [viewMode, menus, selectedMenuSeqs, selectedPermCodes]);

  useEffect(() => {
    if (!showResetConfirm) return;
    function onKey(e) {
      if (e.key === "Escape") setShowResetConfirm(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showResetConfirm]);

  useEffect(() => {
    if (isEmpty) {
      setCollapsedMenuSeqs(new Set());
      setViewMode("tree");
    }
  }, [isEmpty]);

  return (
    <>
      <div class="col-header">
        <div class="col-header-row">
          <h2>선택 현황</h2>
          {!isEmpty && (
            <span class="cart-header-count">
              {menuCount}개 메뉴 · {permCount}개 권한
            </span>
          )}
        </div>
        {!isEmpty && (
          <div class="cart-view-toggle">
            {[
              ["tree", "트리", "메뉴 아래 상세 권한을 바로 펼쳐 보여줘요"],
              ["split", "분리", "메뉴 목록과 상세 권한 목록을 나눠서 보여줘요"],
            ].map(([m, label, tip]) => (
              <button
                key={m}
                class={`cart-view-btn${viewMode === m ? " is-active" : ""}`}
                onClick={() => setViewMode(m)}
                data-tooltip={tip}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div class="col-scroll">
        {isEmpty ? (
          <div class="cart-empty-guide">
            <div class="cart-empty-step">
              <span class="cart-empty-step-num">1</span>
              <div class="cart-empty-step-text">
                <strong>권한 메뉴 선택</strong>
                <span>왼쪽 트리에서 접근할 페이지를 체크해요</span>
              </div>
            </div>
            <div class="cart-empty-step">
              <span class="cart-empty-step-num">2</span>
              <div class="cart-empty-step-text">
                <strong>상세 권한 선택</strong>
                <span>가운데 목록에서 허용할 기능을 골라요</span>
              </div>
            </div>
            <div class="cart-empty-step">
              <span class="cart-empty-step-num">3</span>
              <div class="cart-empty-step-text">
                <strong>복사 후 붙여넣기</strong>
                <span>아래 버튼으로 복사해 결재 시스템에 붙여넣으세요</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "split" ? (
              <div class="cart-tree">
                {lines.map((line, i) => {
                  if (line.type === "perm") return null;

                  if (line.type === "gap")
                    return <div key={i} class="cart-tree-gap" />;

                  if (line.type === "root")
                    return (
                      <div key={i} class="cart-tree-row">
                        <span class="cart-tree-root-label">{line.name}</span>
                      </div>
                    );

                  if (line.type === "branch")
                    return (
                      <div key={i} class="cart-tree-row">
                        <span class="cart-tree-pre">{line.pre}</span>
                        <span class="cart-tree-branch-label">{line.name}</span>
                      </div>
                    );

                  if (line.type === "menu") {
                    const isFocused = focusedMenuSeq === line.nodeId;
                    return (
                      <div
                        key={i}
                        class={`cart-tree-row cart-menu-row${line.noPermsSelected ? " cart-row-no-perm" : ""}${isFocused ? " is-focused" : ""}`}
                        onClick={() =>
                          dispatch({
                            type: "SET_FOCUSED_MENU",
                            menuSeq: line.nodeId,
                          })
                        }
                        data-tooltip="클릭하면 상세 권한이 필터링돼요"
                      >
                        {line.pre && (
                          <span class="cart-tree-pre">{line.pre}</span>
                        )}
                        <span class="cart-tree-check">✓ </span>
                        <span
                          class={`cart-tree-leaf-label${line.noPermsSelected ? " is-unset" : ""}`}
                        >
                          {line.name}
                        </span>
                        {line.permTotal > 0 && (
                          <span
                            class={`cart-perm-toggle is-static${line.noPermsSelected ? " is-zero" : ""}`}
                          >
                            {line.permSelected}/{line.permTotal}개
                          </span>
                        )}
                        <button
                          class="cart-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMenu(line.nodeId);
                          }}
                          data-tooltip="선택 해제"
                          aria-label={`${line.name} 제거`}
                        >
                          <XIcon />
                        </button>
                      </div>
                    );
                  }

                  return null;
                })}
                <div class="cart-split-divider" />
                <div class="cart-split-section-label">상세 권한</div>
                {dedupedPerms.length === 0 ? (
                  <div class="cart-split-empty">선택된 권한 없음</div>
                ) : (
                  dedupedPerms.map((p) => (
                    <div
                      key={p.permissionCode}
                      class="cart-tree-row"
                    >
                      <span class="cart-tree-pre">{"  "}</span>
                      <span class="cart-tree-perm-group">
                        <span class="cart-tree-perm-label">
                          {stripGlossaryMarkers(p.label)}
                        </span>
                        {p.requiresApproval && (
                          <span class="cart-lock">
                            <LockIcon />
                          </span>
                        )}
                      </span>
                      <button
                        class="cart-remove"
                        onClick={() =>
                          dispatch({
                            type: "TOGGLE_PERM",
                            permCode: p.permissionCode,
                          })
                        }
                        data-tooltip="선택 해제"
                        aria-label={`${stripGlossaryMarkers(p.label)} 제거`}
                      >
                        <XIcon />
                      </button>
                    </div>
                  ))
                )}
                <OrphanSection
                  orphanPerms={orphanPerms}
                  dispatch={dispatch}
                  showGap={dedupedPerms.length > 0}
                  permFilter={state.permFilter}
                />
              </div>
            ) : (
              <div class="cart-tree">
                {lines.map((line, i) => {
                  if (line.type === "gap")
                    return <div key={i} class="cart-tree-gap" />;

                  if (line.type === "root")
                    return (
                      <div key={i} class="cart-tree-row">
                        <span class="cart-tree-root-label">{line.name}</span>
                      </div>
                    );

                  if (line.type === "branch")
                    return (
                      <div key={i} class="cart-tree-row">
                        <span class="cart-tree-pre">{line.pre}</span>
                        <span class="cart-tree-branch-label">{line.name}</span>
                      </div>
                    );

                  if (line.type === "menu") {
                    const isFocused = focusedMenuSeq === line.nodeId;
                    const isExpanded = !collapsedMenuSeqs.has(line.nodeId);
                    return (
                      <div
                        key={i}
                        class={`cart-tree-row cart-menu-row${line.noPermsSelected ? " cart-row-no-perm" : ""}${isFocused ? " is-focused" : ""}`}
                        onClick={() =>
                          dispatch({
                            type: "SET_FOCUSED_MENU",
                            menuSeq: line.nodeId,
                          })
                        }
                        data-tooltip="클릭하면 상세 권한이 필터링돼요"
                      >
                        {line.pre && (
                          <span class="cart-tree-pre">{line.pre}</span>
                        )}
                        <span class="cart-tree-check">✓ </span>
                        <span
                          class={`cart-tree-leaf-label${line.noPermsSelected ? " is-unset" : ""}`}
                        >
                          {line.name}
                        </span>
                        {line.permSelected > 0 ? (
                          <button
                            class={`cart-perm-toggle${isExpanded ? " is-expanded" : ""}`}
                            onClick={(e) => togglePermExpand(line.nodeId, e)}
                            data-tooltip={
                              isExpanded ? "권한 목록 접기" : "권한 목록 펼치기"
                            }
                          >
                            {line.permSelected}/{line.permTotal}개
                            <svg
                              viewBox="0 0 10 6"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1.5"
                              class="toggle-chevron"
                            >
                              <path
                                d="M1 1l4 4 4-4"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </button>
                        ) : (
                          line.permTotal > 0 && (
                            <span class="cart-perm-toggle is-static is-zero">
                              {line.permSelected}/{line.permTotal}개
                            </span>
                          )
                        )}
                        <button
                          class="cart-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMenu(line.nodeId);
                          }}
                          data-tooltip="선택 해제"
                          aria-label={`${line.name} 제거`}
                        >
                          <XIcon />
                        </button>
                      </div>
                    );
                  }

                  if (line.type === "perm") {
                    if (collapsedMenuSeqs.has(line.nodeId)) return null;
                    return (
                      <div
                        key={i}
                        class="cart-tree-row"
                      >
                        <span class="cart-tree-pre">{line.pre}</span>
                        <span class="cart-tree-perm-group">
                          <span class="cart-tree-perm-label">
                            {stripGlossaryMarkers(line.perm.label)}
                          </span>
                          {line.perm.requiresApproval && (
                            <span class="cart-lock">
                              <LockIcon />
                            </span>
                          )}
                        </span>
                        <button
                          class="cart-remove"
                          onClick={() =>
                            dispatch({
                              type: "TOGGLE_PERM",
                              permCode: line.perm.permissionCode,
                            })
                          }
                          data-tooltip="선택 해제"
                          aria-label={`${stripGlossaryMarkers(line.perm.label)} 제거`}
                        >
                          <XIcon />
                        </button>
                      </div>
                    );
                  }

                  return null;
                })}

                <OrphanSection
                  orphanPerms={orphanPerms}
                  dispatch={dispatch}
                  showGap={lines.length > 0}
                  permFilter={state.permFilter}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div class="cart-footer">
        <button
          class="btn btn-primary cart-copy-btn"
          onClick={onCopyClick}
          disabled={isEmpty}
          data-tooltip={isEmpty ? "메뉴 또는 권한을 먼저 선택해주세요" : undefined}
        >
          클립보드 복사
        </button>
        <button
          class="btn btn-ghost cart-reset-btn"
          onClick={() => setShowResetConfirm(true)}
        >
          초기화
        </button>
      </div>

      {showResetConfirm && (
        <div class="modal-backdrop" onClick={() => setShowResetConfirm(false)}>
          <div class="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div class="modal-confirm-body">
              <p class="modal-confirm-title">선택 항목을 모두 초기화할까요?</p>
              <p class="modal-confirm-desc">
                메뉴와 상세 권한 선택이 전부 사라집니다.
              </p>
            </div>
            <div class="modal-confirm-footer">
              <button
                class="btn btn-ghost"
                autoFocus
                onClick={() => setShowResetConfirm(false)}
              >
                취소
              </button>
              <button
                class="btn btn-danger"
                onClick={() => {
                  dispatch({ type: "RESET" });
                  setShowResetConfirm(false);
                }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
