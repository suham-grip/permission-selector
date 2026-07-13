export function isLeaf(node) {
  return Array.isArray(node.nodes) && node.nodes.length === 0
}

// parentId 체인을 따라 올라가다 nodeId 자신으로 되돌아오면(데이터 오류로 인한 순환) true
function isCyclic(map, nodeId) {
  const visited = new Set()
  let cur = nodeId
  while (cur != null) {
    if (visited.has(cur)) return true
    visited.add(cur)
    const parent = map[cur]?.parentId
    cur = parent != null && map[parent] ? parent : null
  }
  return false
}

export function buildTree(menus) {
  const map = {}
  for (const m of menus) map[m.nodeId] = { ...m, nodes: [] }
  const roots = []
  for (const m of menus) {
    if (m.parentId == null || !map[m.parentId] || isCyclic(map, m.nodeId)) {
      roots.push(map[m.nodeId])
    } else {
      map[m.parentId].nodes.push(map[m.nodeId])
    }
  }
  return roots
}

// nodeId의 모든 자손 nodeId 목록(순서 무관) — 상위 메뉴 선택 시 순환 참조를 막는 용도
export function getDescendantIds(menus, nodeId) {
  const children = {}
  for (const m of menus) {
    if (m.parentId == null) continue
    if (!children[m.parentId]) children[m.parentId] = []
    children[m.parentId].push(m.nodeId)
  }
  const result = []
  const stack = [...(children[nodeId] ?? [])]
  while (stack.length > 0) {
    const id = stack.pop()
    result.push(id)
    stack.push(...(children[id] ?? []))
  }
  return result
}

export function getAncestorPath(menus, nodeId) {
  const map = {}
  for (const m of menus) map[m.nodeId] = m
  const path = []
  const visited = new Set()
  let cur = map[nodeId]
  while (cur && !visited.has(cur.nodeId)) {
    visited.add(cur.nodeId)
    path.unshift({ nodeId: cur.nodeId, title: cur.title })
    cur = cur.parentId != null ? map[cur.parentId] : null
  }
  return path
}

export function computeOrphanPerms(menus, selectedMenuSeqs, selectedPermCodes) {
  const coveredCodes = new Set(
    menus.filter(m => selectedMenuSeqs.has(m.nodeId))
      .flatMap(m => m.permissions
        .filter(p => selectedPermCodes.has(p.permissionCode))
        .map(p => p.permissionCode))
  )
  const seen = new Set()
  const result = []
  for (const menu of menus) {
    for (const p of menu.permissions) {
      if (selectedPermCodes.has(p.permissionCode) &&
          !coveredCodes.has(p.permissionCode) &&
          !seen.has(p.permissionCode)) {
        result.push(p)
        seen.add(p.permissionCode)
      }
    }
  }
  return result
}
