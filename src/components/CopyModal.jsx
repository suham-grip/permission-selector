import { useState, useEffect, useRef } from "preact/hooks";
import { LockIcon, ChevronIcon } from "./icons.jsx";
import { stripGlossaryMarkers } from "../lib/glossary.jsx";

function ExpandSection({ label, color, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div class="modal-expand-block">
      <button
        class={`modal-expand-toggle modal-expand-toggle--${color}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span class={`modal-expand-chevron${open ? " is-open" : ""}`}>
          <ChevronIcon />
        </span>
        {label}
      </button>
      {open && <ul class="modal-expand-list">{children}</ul>}
    </div>
  );
}

export default function CopyModal({ result, onConfirm, onClose }) {
  const {
    errors,
    missingMenus = [],
    approvalPerms = [],
    orphanPerms = [],
    needsApproval,
  } = result;
  const hasError = errors.length > 0;
  const primaryRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  return (
    <div
      class="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{hasError ? "복사 불가" : "복사 전 확인"}</h2>
          <p class="modal-subtitle">
            {hasError
              ? "아래 항목을 확인해주세요."
              : "아래 내용을 확인 후 복사를 진행해주세요."}
          </p>
        </div>

        <div class="modal-body">
          {hasError && (
            <div class="modal-notice modal-notice--error">
              {errors.map((msg, i) => (
                <div key={i} class="modal-notice-row">
                  <span class="modal-notice-icon">✕</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

          {missingMenus.length > 0 && (
            <div class="modal-notice modal-notice--warn">
              <div class="modal-notice-header">
                <span class="modal-notice-dashed-circle modal-notice-dashed-circle--warn" />
                <span class="modal-notice-title modal-notice-title--warn">
                  상세권한이 비어있는 메뉴가 있어요
                </span>
              </div>
              <p class="modal-notice-desc">
                상세 권한 미선택시 메뉴 페이지를 정상적으로 이용하지 못할 수
                있어요.
              </p>
              <ExpandSection
                label={`${missingMenus.length}개 메뉴 자세히 보기`}
                color="warn"
              >
                {missingMenus.map((name) => (
                  <li key={name} class="modal-expand-item">
                    <span class="modal-expand-dot modal-expand-dot--warn" />
                    <span class="modal-expand-item-text">{name}</span>
                  </li>
                ))}
              </ExpandSection>
            </div>
          )}

          {orphanPerms.length > 0 && (
            <div class="modal-notice modal-notice--warn">
              <div class="modal-notice-header">
                <span class="modal-notice-dashed-circle modal-notice-dashed-circle--warn" />
                <span class="modal-notice-title modal-notice-title--warn">
                  메뉴 없이 선택된 상세권한이 있어요
                </span>
              </div>
              <p class="modal-notice-desc">
                메뉴를 선택하지 않으면 해당 페이지에 접근할 수 없어요.
              </p>
              <ExpandSection
                label={`${orphanPerms.length}개 권한 자세히 보기`}
                color="warn"
              >
                {orphanPerms.map((p) => (
                  <li key={p.permissionCode} class="modal-expand-item">
                    <span class="modal-expand-dot modal-expand-dot--warn" />
                    <span class="modal-expand-item-text">{stripGlossaryMarkers(p.label)}</span>
                  </li>
                ))}
              </ExpandSection>
            </div>
          )}

          {needsApproval && !hasError && (
            <div class="modal-notice modal-notice--danger">
              <div class="modal-notice-header">
                <span class="modal-notice-big-icon modal-notice-big-icon--danger">
                  <LockIcon />
                </span>
                <span class="modal-notice-title modal-notice-title--danger">
                  정보보안 담당자의 결재가 필요해요
                </span>
              </div>
              <p class="modal-notice-desc">
                결재 라인에 정보보안 담당자를 반드시 추가해주세요.
              </p>
              <ExpandSection
                label={`${approvalPerms.length}개 권한 자세히 보기`}
                color="danger"
              >
                {approvalPerms.map((p) => (
                  <li key={p.permissionCode} class="modal-expand-item">
                    <span class="modal-expand-dot modal-expand-dot--danger" />
                    <span class="modal-expand-item-text">{stripGlossaryMarkers(p.label)}</span>
                  </li>
                ))}
              </ExpandSection>
            </div>
          )}
        </div>

        <div class="modal-footer">
          <button
            class="btn btn-ghost"
            onClick={onClose}
            ref={hasError ? primaryRef : null}
          >
            닫기
          </button>
          {!hasError && (
            <button
              class="btn btn-primary copy-modal-confirm-btn"
              onClick={onConfirm}
              ref={primaryRef}
            >
              복사하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
