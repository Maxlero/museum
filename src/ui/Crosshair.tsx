import { useAccessChallenge } from '../interaction/AccessChallengeContext'

export function Crosshair() {
  const { activeTerminal } = useAccessChallenge()
  if (activeTerminal) return null
  return <div className="crosshair" aria-hidden="true" />
}
