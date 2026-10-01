import { PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Vector3 } from 'three'
import { ROOM } from '../museum/config'
import { isWalkablePosition } from './collisionWorld'

const WALK_SPEED = 3.5
const PLAYER_HEIGHT = 1.65

export function PlayerController() {
  const { camera } = useThree()
  const keys = useMemo(() => new Set<string>(), [])
  const forward = useMemo(() => new Vector3(), [])
  const right = useMemo(() => new Vector3(), [])
  const movement = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => keys.add(event.code)
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code)
    const onBlur = () => keys.clear()
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [keys])

  useFrame((_, delta) => {
    if (!document.pointerLockElement) return
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    right.crossVectors(forward, camera.up).normalize()

    movement.set(0, 0, 0)
    if (keys.has('KeyW') || keys.has('ArrowUp')) movement.add(forward)
    if (keys.has('KeyS') || keys.has('ArrowDown')) movement.sub(forward)
    if (keys.has('KeyD') || keys.has('ArrowRight')) movement.add(right)
    if (keys.has('KeyA') || keys.has('ArrowLeft')) movement.sub(right)
    if (movement.lengthSq() > 0) movement.normalize().multiplyScalar(WALK_SPEED * Math.min(delta, 0.05))

    const nextX = camera.position.x + movement.x
    if (isWalkablePosition(nextX, camera.position.z, ROOM.playerRadius)) {
      camera.position.x = nextX
    }
    const nextZ = camera.position.z + movement.z
    if (isWalkablePosition(camera.position.x, nextZ, ROOM.playerRadius)) {
      camera.position.z = nextZ
    }
    camera.position.y = PLAYER_HEIGHT
  })

  return <PointerLockControls selector="canvas" />
}
