import { useEffect } from 'preact/hooks'

function ToastItem({ t, onDismiss }) {
  useEffect(() => {
    const h = setTimeout(() => onDismiss(t.id), 2500)
    return () => clearTimeout(h)
  }, [])

  return (
    <div class={`toast toast-${t.type}`} onClick={() => onDismiss(t.id)}>
      {t.message}
    </div>
  )
}

export default function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div class="toast-container" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <ToastItem key={t.id} t={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
