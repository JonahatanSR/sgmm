import React from 'react'

type Props = {
  open: boolean
  title?: string
  onClose: () => void
  actions?: React.ReactNode
  children?: React.ReactNode
}

export default function Modal({ open, title, onClose, actions, children }: Props) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#fff', borderRadius: 8, minWidth: 360, maxWidth: 640, padding: 16 }}>
        {title ? <h3 style={{ marginBottom: 8, fontWeight: 600 }}>{title}</h3> : null}
        <div style={{ marginBottom: 12 }}>{children}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {actions}
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}



