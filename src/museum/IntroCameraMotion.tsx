import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Clock, Vector3 } from 'three'

const INTRO_POSITION = new Vector3(0, 1.65, 5.8)
const INTRO_TARGET = new Vector3(0, 1.95, -5.5)

export function IntroCameraMotion() {
  const { camera } = useThree()
  const clock = useMemo(() => new Clock(), [])
  const hasEntered = useRef(false)
  const transitionStartedAt = useRef<number | null>(null)
  const transitionStart = useRef(new Vector3())
  const transitionEnd = useRef(new Vector3())
  const direction = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const onPointerLockChange = () => {
      if (document.pointerLockElement && !hasEntered.current) {
        hasEntered.current = true
        transitionStartedAt.current = performance.now()
        transitionStart.current.copy(camera.position)
        camera.getWorldDirection(direction)
        transitionEnd.current.copy(camera.position).add(direction.multiplyScalar(0.55))
      }
    }
    document.addEventListener('pointerlockchange', onPointerLockChange)
    return () => document.removeEventListener('pointerlockchange', onPointerLockChange)
  }, [camera, direction])

  useFrame(() => {
    if (!hasEntered.current) {
      const elapsed = clock.getElapsedTime()
      camera.position.set(
        INTRO_POSITION.x + Math.sin(elapsed * 0.16) * 0.14,
        INTRO_POSITION.y + Math.sin(elapsed * 0.11) * 0.025,
        INTRO_POSITION.z + Math.cos(elapsed * 0.13) * 0.08,
      )
      camera.lookAt(
        INTRO_TARGET.x + Math.sin(elapsed * 0.09) * 0.25,
        INTRO_TARGET.y + Math.cos(elapsed * 0.12) * 0.08,
        INTRO_TARGET.z,
      )
      return
    }

    if (transitionStartedAt.current !== null) {
      const elapsed = performance.now() - transitionStartedAt.current
      const progress = Math.min(elapsed / 1250, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      camera.position.lerpVectors(transitionStart.current, transitionEnd.current, eased)
      if (progress === 1) transitionStartedAt.current = null
    }
  })

  return null
}
