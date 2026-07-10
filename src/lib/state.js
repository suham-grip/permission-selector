export const initialState = {
  menus: [],
  selectedMenuSeqs: new Set(),
  selectedPermCodes: new Set(),
  focusedMenuSeq: null,
  menuSearch: '',
  permSearch: '',
  permFilter: null,
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_MENUS':
      return { ...state, menus: action.menus }

    case 'TOGGLE_MENU': {
      const seq = action.menuSeq
      const next = new Set(state.selectedMenuSeqs)
      if (next.has(seq)) {
        next.delete(seq)
        return {
          ...state,
          selectedMenuSeqs: next,
          focusedMenuSeq: state.focusedMenuSeq === seq ? null : state.focusedMenuSeq,
        }
      } else {
        next.add(seq)
        return { ...state, selectedMenuSeqs: next }
      }
    }

    case 'TOGGLE_PERM': {
      const code = action.permCode
      const next = new Set(state.selectedPermCodes)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return { ...state, selectedPermCodes: next }
    }

    case 'SET_FOCUSED_MENU':
      return {
        ...state,
        focusedMenuSeq: state.focusedMenuSeq === action.menuSeq ? null : action.menuSeq,
      }

    case 'SET_PERM_FILTER':
      return {
        ...state,
        permFilter: action.permCode === state.permFilter ? null : action.permCode,
      }

    case 'SET_MENU_SEARCH':
      return { ...state, menuSearch: action.value }

    case 'SET_PERM_SEARCH':
      return { ...state, permSearch: action.value }

    case 'ACTIVATE_SHORTCUT': {
      const { shortcut } = action
      const m = new Set(state.selectedMenuSeqs)
      const p = new Set(state.selectedPermCodes)
      for (const s of shortcut.menus) m.add(s)
      for (const c of shortcut.perms) p.add(c)
      return { ...state, selectedMenuSeqs: m, selectedPermCodes: p }
    }

    case 'DEACTIVATE_SHORTCUT': {
      const { shortcut } = action
      const m = new Set(state.selectedMenuSeqs)
      const p = new Set(state.selectedPermCodes)
      for (const s of shortcut.menus) m.delete(s)
      for (const c of shortcut.perms) p.delete(c)
      const focusedCleared = shortcut.menus.includes(state.focusedMenuSeq)
      return {
        ...state,
        selectedMenuSeqs: m,
        selectedPermCodes: p,
        focusedMenuSeq: focusedCleared ? null : state.focusedMenuSeq,
      }
    }

    case 'RESET':
      return { ...initialState, menus: state.menus }

    default:
      return state
  }
}
