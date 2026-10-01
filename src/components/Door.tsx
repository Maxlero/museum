import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, MathUtils, Vector3 } from 'three'
import { removeDoorCollider, updateDoorCollider } from '../player/collisionWorld'

type DoorProps = {
  id: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  thickness?: number
  openAngle?: number
  interactionDistance?: number
}

export function Door({
  id,
  position,
  rotation = [0, 0, 0],
  width = 1.6,
  height = 2.4,
  thickness = 0.12,
  openAngle = -Math.PI / 2,
  interactionDistance = 2.35,
}: DoorProps) {
  const { camera } = useThree()
  const hinge = useRef<Group>(null)
  const angle = useRef(0)
  const nearbyRef = useRef(false)
  const [nearby, setNearby] = useState(false)
  const [open, setOpen] = useState(false)
  const doorCenter = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyE' && !event.repeat && nearbyRef.current) {
        setOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => () => removeDoorCollider(id), [id])

  useFrame((_, delta) => {
    const targetAngle = open ? openAngle : 0
    angle.current = MathUtils.damp(angle.current, targetAngle, 6, delta)
    if (hinge.current) hinge.current.rotation.y = angle.current

    const worldAngle = rotation[1] + angle.current
    const startX = position[0]
    const startZ = position[2]
    updateDoorCollider(id, {
      startX,
      startZ,
      endX: startX + Math.sin(worldAngle) * width,
      endZ: startZ + Math.cos(worldAngle) * width,
      thickness,
    })

    doorCenter.set(
      startX + Math.sin(rotation[1]) * width * 0.5,
      position[1] + height * 0.5,
      startZ + Math.cos(rotation[1]) * width * 0.5,
    )
    const isNearby = camera.position.distanceTo(doorCenter) < interactionDistance
    if (nearbyRef.current !== isNearby) {
      nearbyRef.current = isNearby
      setNearby(isNearby)
    }
  })

  return (
    <group position={position} rotation={rotation}>
      <group ref={hinge}>
        <mesh castShadow receiveShadow position={[0, height / 2 + 0.03, width / 2]}>
          <boxGeometry args={[thickness, height, width]} />
          <meshStandardMaterial color="#4d2c18" roughness={0.62} metalness={0.04} />
        </mesh>
        <mesh castShadow position={[-thickness / 2 - 0.025, height / 2 + 0.03, width / 2]}>
          <boxGeometry args={[0.035, height - 0.18, width - 0.18]} />
          <meshStandardMaterial color="#704528" roughness={0.58} />
        </mesh>
        <mesh castShadow position={[-thickness / 2 - 0.07, 1.08, width - 0.22]}>
          <sphereGeometry args={[0.065, 18, 12]} />
          <meshStandardMaterial color="#b38b48" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      <mesh castShadow position={[0, height / 2, -0.09]}>
        <boxGeometry args={[0.22, height + 0.18, 0.18]} />
        <meshStandardMaterial color="#33271e" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, height / 2, width + 0.09]}>
        <boxGeometry args={[0.22, height + 0.18, 0.18]} />
        <meshStandardMaterial color="#33271e" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, height + 0.09, width / 2]}>
        <boxGeometry args={[0.22, 0.18, width + 0.36]} />
        <meshStandardMaterial color="#33271e" roughness={0.62} />
      </mesh>

      {nearby && (
        <Html center position={[-0.5, 1.45, width / 2]} zIndexRange={[30, 0]}>
          <div className="door-prompt">Press E to {open ? 'close' : 'open'}</div>
        </Html>
      )}
    </group>
  )
}
