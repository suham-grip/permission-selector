import { SHORTCUTS } from "../data/shortcuts.js";

export function getExplicitCascades(sc) {
  const cascades = [];
  for (const cascadeChipKey of (sc.cascades ?? [])) {
    const colonIdx = cascadeChipKey.indexOf(":");
    if (colonIdx === -1) continue;
    const cascadeMenuSeq = cascadeChipKey.slice(0, colonIdx);
    const cascadeLabel = cascadeChipKey.slice(colonIdx + 1);
    const shortcuts = SHORTCUTS[cascadeMenuSeq] ?? [];
    const cascadeSc = shortcuts.find((s) => s.label === cascadeLabel);
    if (!cascadeSc) continue;
    const cascadeEffective = {
      ...cascadeSc,
      menus: cascadeSc.menus.includes(cascadeMenuSeq)
        ? cascadeSc.menus
        : [cascadeMenuSeq, ...cascadeSc.menus],
    };
    cascades.push({ chipKey: cascadeChipKey, shortcut: cascadeEffective });
  }
  return cascades;
}

export function getEffectiveTargets(sc, parentSeq) {
  const menus = new Set(
    sc.menus.includes(parentSeq) ? sc.menus : [parentSeq, ...sc.menus],
  );
  const perms = new Set(sc.perms);
  const visited = new Set([`${parentSeq}:${sc.label}`]);
  const queue = [...getExplicitCascades(sc)];

  while (queue.length > 0) {
    const { chipKey: cKey, shortcut: cSc } = queue.shift();
    if (visited.has(cKey)) continue;
    visited.add(cKey);
    for (const seq of cSc.menus) menus.add(seq);
    for (const code of cSc.perms) perms.add(code);
    for (const next of getExplicitCascades(cSc)) {
      if (!visited.has(next.chipKey)) queue.push(next);
    }
  }

  return { menus: [...menus], perms: [...perms] };
}

// effective target(menus/perms)이 현재 선택 상태에서 전부 선택되어 있는지 판별
// (칩 활성 표시, 묶음-분리 토스트, 권한 출처 표시 등 "묶음이 완전히 선택됐다"는
// 판정을 이 함수 하나로 통일해 여러 곳에서 로직이 어긋나지 않게 한다)
export function isShortcutFullySelected(eff, selectedMenuSeqs, selectedPermCodes) {
  if (eff.menus.length + eff.perms.length === 0) return false;
  return (
    eff.menus.every((s) => selectedMenuSeqs.has(s)) &&
    eff.perms.every((c) => selectedPermCodes.has(c))
  );
}
