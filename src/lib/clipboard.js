import { buildTree, isLeaf, getAncestorPath, computeOrphanPerms } from './tree.js'
import { stripGlossaryMarkers } from './glossary.jsx'

function buildLines(state) {
  const { menus, selectedMenuSeqs, selectedPermCodes } = state
  const tree = buildTree(menus)
  const lines = []

  // 선택된 leaf를 DFS 순서대로 수집
  function collectSelectedLeaves(nodes) {
    const result = []
    for (const node of nodes) {
      if (isLeaf(node)) {
        if (selectedMenuSeqs.has(node.nodeId)) result.push(node)
      } else {
        result.push(...collectSelectedLeaves(node.nodes || []))
      }
    }
    return result
  }

  const orderedLeaves = collectSelectedLeaves(tree)

  // ── 섹션 1: 메뉴명 ──────────────────────────────────────────
  if (orderedLeaves.length > 0) {
    lines.push('메뉴명')
    for (const leaf of orderedLeaves) {
      const path = getAncestorPath(menus, leaf.nodeId)
      lines.push(path.map(n => n.title).join(' > '))
    }
  }

  // ── 섹션 2: 상세 권한 ────────────────────────────────────────
  // 각 permissionCode가 포함된 선택 메뉴 목록 (DFS 순서 유지)
  const permToLeaves = {}
  for (const leaf of orderedLeaves) {
    for (const p of leaf.permissions) {
      if (!selectedPermCodes.has(p.permissionCode)) continue
      if (!permToLeaves[p.permissionCode]) permToLeaves[p.permissionCode] = { perm: p, leaves: [] }
      permToLeaves[p.permissionCode].leaves.push(leaf)
    }
  }

  // permissionCode 기준 중복 제거 후 DFS 순서로 정렬
  const seen = new Set()
  const permEntries = []
  for (const leaf of orderedLeaves) {
    for (const p of leaf.permissions) {
      if (!selectedPermCodes.has(p.permissionCode)) continue
      if (seen.has(p.permissionCode)) continue
      seen.add(p.permissionCode)
      permEntries.push(permToLeaves[p.permissionCode])
    }
  }

  const orphanPerms = computeOrphanPerms(menus, selectedMenuSeqs, selectedPermCodes)

  if (permEntries.length > 0 || orphanPerms.length > 0) {
    if (lines.length > 0) lines.push('')
    lines.push('상세 권한')

    for (const { perm, leaves } of permEntries) {
      const firstName = leaves[0].title
      const extra = leaves.length - 1
      const prefix = extra > 0 ? `${firstName} 외 ${extra}개` : firstName
      lines.push(`${prefix} > ${stripGlossaryMarkers(perm.label)}`)
    }

    for (const p of orphanPerms) {
      lines.push(`권한 메뉴 없음 > ${stripGlossaryMarkers(p.label)}`)
    }
  }

  return lines
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function toNbsp(s) {
  return escHtml(s).replace(/ /g, '&nbsp;')
}

export function generateClipboardText(state) {
  return buildLines(state).join('\n')
}

export function generateClipboardHtml(state) {
  const lines = buildLines(state)
  const parts = []
  for (const line of lines) {
    if (line === '') {
      parts.push('')
      continue
    }
    const isHeader = line === '메뉴명' || line === '상세 권한'
    if (isHeader) {
      parts.push(`<strong style="font-size:10pt;">${toNbsp(line)}</strong>`)
    } else if (line.includes(' > ')) {
      const gtIdx = line.lastIndexOf(' > ')
      const prefix = toNbsp(line.slice(0, gtIdx + 3))
      const rest = toNbsp(line.slice(gtIdx + 3))
      parts.push(
        `<span style="font-size:10pt;">${prefix}</span>` +
        `<em style="font-size:9pt;font-style:italic;">${rest}</em>`
      )
    } else {
      parts.push(`<span style="font-size:10pt;">${toNbsp(line)}</span>`)
    }
  }
  return `<div style="font-size:10pt;">${parts.join('<br>')}</div>`
}
