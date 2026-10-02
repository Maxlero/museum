import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { useAccessChallenge } from '../interaction/AccessChallengeContext'

export function StartOverlay() {
  const [locked, setLocked] = useState(false)
  const [ready, setReady] = useState(false)
  const { active, progress } = useProgress()
  const { activeTerminal } = useAccessChallenge()

  useEffect(() => {
    const onChange = () => setLocked(Boolean(document.pointerLockElement))
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  useEffect(() => {
    if (active || progress < 100) return
    const timeout = window.setTimeout(() => setReady(true), 180)
    return () => window.clearTimeout(timeout)
  }, [active, progress])

  const enter = () => {
    if (!ready) return
    document.querySelector('canvas')?.requestPointerLock()
  }

  if (activeTerminal) return null

  return (
    <div className={`start-overlay ${ready ? 'ready' : ''} ${locked ? 'hidden' : ''}`} onClick={enter}>
      <section className="intro">
        <p className="eyebrow">PRIVATE COLLECTION · EST. 2026</p>
        <h1>Музей Марии</h1>
        <p className="intro-copy">
          Коллекция воспоминаний, артефактов и нескольких вещей, которым здесь, вероятно, не место.
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
