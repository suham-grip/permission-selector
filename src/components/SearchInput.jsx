import { useState, useRef, useEffect } from 'preact/hooks'
import { forwardRef } from 'preact/compat'

const SearchInput = forwardRef(function SearchInput({ value, onChange, placeholder }, ref) {
  const [inputValue, setInputValue] = useState(value)
  const timerRef = useRef(null)
  const internalRef = useRef(null)

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
      clearTimeout(timerRef.current)
    }
  }, [value])

  function handleInput(e) {
    const v = e.target.value
    setInputValue(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(v), 150)
  }

  function handleClear() {
    setInputValue('')
    clearTimeout(timerRef.current)
    onChange('')
    internalRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') handleClear()
  }

  function setRef(el) {
    internalRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }

  return (
    <div class="search-input-wrap">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="M12.5 12.5 17 17" stroke-linecap="round" />
      </svg>
      <input
        ref={setRef}
        class="search-input"
        type="text"
        value={inputValue}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {inputValue && (
        <button
          class="search-clear-btn"
          onClick={handleClear}
          tabIndex={-1}
          aria-label="검색어 지우기"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke-linecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
})

export default SearchInput
