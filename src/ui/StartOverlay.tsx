import { useEffect, useState } from 'react'

export function StartOverlay() {
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const onChange = () => setLocked(Boolean(document.pointerLockElement))
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  const enter = () => document.querySelector('canvas')?.requestPointerLock()

  return (
    <div className={`start-overlay ${locked ? 'hidden' : ''}`} onClick={enter}>
      <section className="intro">
        <p className="eyebrow">PRIVATE COLLECTION · EST. 2026</p>
        <h1>Музей Марии</h1>
        <p className="intro-copy">
          Некоторые воспоминания лучше рассматривать вблизи.
        </p>
        <div className="ticket-details" aria-label="Данные билета">
          <span>ADMISSION: ONE</span>
          <span>VISITOR: MARY</span>
          <span>TICKET №031</span>
        </div>
        <button className="enter-button" type="button">Открыть выставку</button>
        <p className="controls">WASD — идти · мышь — осматриваться · Esc — пауза</p>
      </section>
      <p className="museum-note">Photography permitted. Touching the exhibits is strongly discouraged.</p>
    </div>
  )
}
