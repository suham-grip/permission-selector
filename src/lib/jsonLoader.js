import { HELP_TEXTS } from '../data/helpTexts.js'
import { SHORTCUTS } from '../data/shortcuts.js'

// PermNode 트리에서 DFS로 leaf(nodes 없거나 빈 배열) 노드만 추출
function flatPermissions(nodes) {
  const result = []
  for (const node of nodes) {
    if (!node.nodes || node.nodes.length === 0) {
      result.push(node)
    } else {
      result.push(...flatPermissions(node.nodes))
    }
  }
  return result
}

export function parseMenus(raw) {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw

  const leaves = flatPermissions(data.permissions ?? [])
  const permMap = {}
  for (const node of leaves) {
    permMap[node.code] = {
      // helpTexts.js(permissionNames) 우선 — 재수집으로 menus.json이 통째로 갈아끼워져도
      // 편집기에서 바꾼 권한 이름은 유지된다.
      label: HELP_TEXTS.permissionNames?.[node.code] ?? node.label ?? node.code,
      requiresApproval: node.approvalNeeded ?? false,
      // helpTexts.js 우선, 없으면 menus.json 인라인 값 fallback
      helpText: HELP_TEXTS.permissions[node.code] ?? node.helpText ?? null,
    }
  }

  return (data.menus ?? []).map(m => {
    const inlineOverrides = m.permissionHelpText ?? {}
    const overlayOverrides = HELP_TEXTS.menuOverrides[String(m.nodeId)] ?? {}
    // helpTexts.js 우선, 없으면 menus.json 인라인 값 fallback
    const menuOverrides = { ...inlineOverrides, ...overlayOverrides }
    return {
      nodeId: m.nodeId,
      // helpTexts.js(menuTitles) 우선 — 재수집으로 menus.json이 통째로 갈아끼워져도
      // 편집기에서 바꾼 메뉴 이름은 유지된다.
      title: HELP_TEXTS.menuTitles?.[String(m.nodeId)] ?? m.title,
      label: HELP_TEXTS.menuDescriptions[String(m.nodeId)] ?? m.label ?? null,
      parentId: m.parentId ?? null,
      restricted: m.restricted ?? false,
      shortcuts: SHORTCUTS[String(m.nodeId)] ?? [],
      permissions: (m.scopeRefs ?? [])
        .filter(code => permMap[code] != null)
        .map(code => ({
          permissionCode: code,
          label: permMap[code].label,
          requiresApproval: permMap[code].requiresApproval,
          helpText: permMap[code].helpText,
          menuHelpText: menuOverrides[code] ?? null,
        })),
    }
  })
}
