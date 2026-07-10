export function normalize(s) {
  return s.replace(/\s+/g, '').toLowerCase()
}

export function highlight(text, query) {
  if (!query) return text
  const normText = normalize(text)
  const normQuery = normalize(query)
  if (!normQuery || !normText.includes(normQuery)) return text

  const normToOrig = []
  for (let i = 0; i < text.length; i++) {
    if (!/\s/.test(text[i])) normToOrig.push(i)
  }

  const parts = []
  let lastOrigEnd = 0
  let searchFrom = 0
  while (true) {
    const ns = normText.indexOf(normQuery, searchFrom)
    if (ns === -1) break
    const ne = ns + normQuery.length - 1
    const origStart = normToOrig[ns]
    const origEnd = normToOrig[ne] + 1
    if (origStart > lastOrigEnd) parts.push(text.slice(lastOrigEnd, origStart))
    parts.push(<mark class="search-highlight">{text.slice(origStart, origEnd)}</mark>)
    lastOrigEnd = origEnd
    searchFrom = ne + 1
  }
  if (lastOrigEnd < text.length) parts.push(text.slice(lastOrigEnd))
  return parts.length ? parts : text
}

export function chipLabel(key) {
  const i = key.indexOf(':')
  return i === -1 ? key : key.slice(i + 1)
}
