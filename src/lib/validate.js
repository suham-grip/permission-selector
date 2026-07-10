import { getAncestorPath, computeOrphanPerms } from './tree.js'

export function validate(state) {
  const errors = []
  const warnings = []
  const missingMenus = []
  const approvalPerms = []
  let needsApproval = false

  if (state.selectedMenuSeqs.size === 0 && state.selectedPermCodes.size === 0) {
    errors.push('권한 메뉴 또는 상세 권한을 선택해주세요.')
    return { errors, warnings, missingMenus, approvalPerms, needsApproval, orphanPerms: [] }
  }

  const menuMap = Object.fromEntries(state.menus.map(m => [m.nodeId, m]))

  for (const seq of state.selectedMenuSeqs) {
    const menu = menuMap[seq]
    if (!menu) continue
    const hasSelected = menu.permissions.some(p => state.selectedPermCodes.has(p.permissionCode))
    if (!hasSelected && menu.permissions.length > 0) {
      const path = getAncestorPath(state.menus, seq).map(n => n.title).join(' > ')
      missingMenus.push(path)
    }
  }
  if (missingMenus.length > 0) {
    warnings.push('상세 권한을 선택하지 않은 메뉴가 있습니다.')
  }

  const orphanPerms = computeOrphanPerms(state.menus, state.selectedMenuSeqs, state.selectedPermCodes)
  if (orphanPerms.length > 0) {
    warnings.push('연결된 메뉴 없이 선택된 상세 권한이 있습니다.')
  }

  const seenApproval = new Set()
  // 선택된 메뉴의 결재 권한
  for (const seq of state.selectedMenuSeqs) {
    const menu = menuMap[seq]
    if (!menu) continue
    for (const p of menu.permissions) {
      if (p.requiresApproval && state.selectedPermCodes.has(p.permissionCode) && !seenApproval.has(p.permissionCode)) {
        seenApproval.add(p.permissionCode)
        approvalPerms.push(p)
        needsApproval = true
      }
    }
  }
  // orphan 권한 중 결재 필요한 것
  for (const p of orphanPerms) {
    if (p.requiresApproval && !seenApproval.has(p.permissionCode)) {
      seenApproval.add(p.permissionCode)
      approvalPerms.push(p)
      needsApproval = true
    }
  }
  if (needsApproval) {
    warnings.push('보안담당자 결재가 필요한 권한이 포함되어 있습니다.')
  }

  return { errors, warnings, missingMenus, approvalPerms, needsApproval, orphanPerms }
}
