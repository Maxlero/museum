import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Group, MathUtils, Vector3 } from 'three'
import { removeDoorCollider, updateDoorCollider } from '../player/collisionWorld'
import { useAccessChallenge } from '../interaction/AccessChallengeContext'
import type { AccessTerminalConfig, DoorAccessSignConfig, KeypadConfig } from '../museum/config'
import { AccessTerminal, type AccessMode, type AccessStatus } from './AccessTerminal'

type DoorProps = {
  id: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  thickness?: number
  openAngle?: number
  interactionDistance?: number
  openSpeed?: number
  accessCode?: string
  challengeMode?: AccessMode
  collectionTitle?: string
  restrictedMessage?: string
  grantedMessage?: string
  panelSide?: -1 | 1
  accessSign?: DoorAccessSignConfig
  keypad?: KeypadConfig
  terminal?: AccessTerminalConfig
  autoCloseSeconds?: number
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
  openSpeed = 6,
  accessCode,
  challengeMode,
  collectionTitle = 'PRIVATE COLLECTION',
  restrictedMessage = 'Access restricted.',
  grantedMessage = 'Access granted.\nCurator assumes no responsibility for what follows.',
  panelSide = -1,
  accessSign,
  keypad,
  terminal,
  autoCloseSeconds,
}: DoorProps) {
  const { camera } = useThree()
  const hinge = useRef<Group>(null)
  const angle = useRef(0)
  const nearbyRef = useRef(false)
  const [nearby, setNearby] = useState(false)
  const [open, setOpen] = useState(false)
  const accessMode = challengeMode ?? (accessCode ? 'pin' : undefined)
  const [unlocked, setUnlocked] = useState(!accessMode)
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(accessMode ? 'locked' : 'granted')
  const { completedDoors } = useAccessChallenge()
  const doorCenter = useMemo(() => new Vector3(), [])
  const hasAccessTerminal = Boolean(accessMode && (terminal || keypad))

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (hasAccessTerminal || event.code !== 'KeyE' || event.repeat || !nearbyRef.current) return
      setOpen((current) => !current)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasAccessTerminal])

  useEffect(() => {
    if (accessMode !== 'solitaire' || !completedDoors.has(id) || unlocked) return
    setUnlocked(true)
    setAccessStatus('granted')
    setOpen(true)
  }, [accessMode, completedDoors, id, unlocked])

  const unlock = useCallback(() => {
    setUnlocked(true)
    setAccessStatus('granted')
    setOpen(true)
  }, [])

  const toggle = useCallback(() => setOpen((current) => !current), [])

  useEffect(() => () => removeDoorCollider(id), [id])

  useEffect(() => {
    if (!open || !autoCloseSeconds) return
    const timeout = window.setTimeout(() => setOpen(false), autoCloseSeconds * 1000)
    return () => window.clearTimeout(timeout)
  }, [autoCloseSeconds, open])

  useFrame((_, delta) => {
    const targetAngle = open ? openAngle : 0
    angle.current = MathUtils.damp(angle.current, targetAngle, openSpeed, delta)
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
        <mesh castShadow position={[thickness / 2 + 0.07, 1.08, width - 0.22]}>
          <sphereGeometry args={[0.065, 18, 12]} />
          <meshStandardMaterial color="#b38b48" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh
          castShadow
          position={[0, 1.08, width - 0.22]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.022, 0.022, thickness + 0.14, 12]} />
          <meshStandardMaterial color="#8e6b35" roughness={0.34} metalness={0.68} />
        </mesh>
      </group>

      {accessMode && hasAccessTerminal && (
        <AccessTerminal
          doorId={id}
          mode={accessMode}
          side={panelSide}
          title={collectionTitle}
          restrictedMessage={restrictedMessage}
          accessCode={accessCode}
          status={accessStatus}
          nearby={nearby}
          unlocked={unlocked}
          open={open}
          accessSign={accessSign}
          keypad={keypad}
          terminal={terminal}
          promptZ={width / 2}
          onUnlock={unlock}
          onToggle={toggle}
        />
      )}

      {nearby && !hasAccessTerminal && (
        <Html center position={[panelSide * 0.5, 1.45, width / 2]} zIndexRange={[30, 0]}>
          <div className="door-prompt">
            <span>Press E to {open ? 'close' : 'open'}</span>
          </div>
        </Html>
      )}
    </group>
  )
}
