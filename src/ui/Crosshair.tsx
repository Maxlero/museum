import { useAccessChallenge } from '../interaction/AccessChallengeContext'

export function Crosshair() {
  const { interactionOpen } = useAccessChallenge()
  if (interactionOpen) return null
  return <div className="crosshair" aria-hidden="true" />
}
