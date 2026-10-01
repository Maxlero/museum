import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, MathUtils, Vector3 } from 'three'
import { removeDoorCollider, updateDoorCollider } from '../player/collisionWorld'
import type { DoorAccessSignConfig, KeypadConfig } from '../museum/config'
import { DoorAccessPanel } from './DoorAccessPanel'

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
  collectionTitle?: string
  restrictedMessage?: string
  grantedMessage?: string
  panelSide?: -1 | 1
  accessSign?: DoorAccessSignConfig
  keypad?: KeypadConfig
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
  collectionTitle = 'PRIVATE COLLECTION',
  restrictedMessage = 'Access restricted.',
  grantedMessage = 'Access granted.\nCurator assumes no responsibility for what follows.',
  panelSide = -1,
  accessSign,
  keypad,
  autoCloseSeconds,
}: DoorProps) {
  const { camera } = useThree()
  const hinge = useRef<Group>(null)
  const angle = useRef(0)
  const nearbyRef = useRef(false)
  const [nearby, setNearby] = useState(false)
  const [open, setOpen] = useState(false)
  const [unlocked, setUnlocked] = useState(!accessCode)
  const [keypadActive, setKeypadActive] = useState(false)
  const [enteredCode, setEnteredCode] = useState('')
  const [accessStatus, setAccessStatus] = useState<'locked' | 'granted' | 'denied'>(
    accessCode ? 'locked' : 'granted',
  )
  const doorCenter = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (keypadActive) {
        if (event.code === 'Escape') {
          setKeypadActive(false)
          setEnteredCode('')
          return
        }
        if (event.code === 'Backspace') {
          event.preventDefault()
          setEnteredCode((current) => current.slice(0, -1))
          return
        }
        if (event.code === 'Enter') {
          if (enteredCode === accessCode) {
            setUnlocked(true)
            setAccessStatus('granted')
            setKeypadActive(false)
            setEnteredCode('')
            setOpen(true)
          } else {
            setAccessStatus('denied')
            setEnteredCode('')
          }
          return
        }
        if (/^Digit\d$/.test(event.code) || /^Numpad\d$/.test(event.code)) {
          const digit = event.code.slice(-1)
          setAccessStatus('locked')
          setEnteredCode((current) => (current + digit).slice(0, 8))
        }
        return
      }

      if (event.code === 'KeyE' && !event.repeat && nearbyRef.current) {
        if (unlocked) {
          setOpen((current) => !current)
        } else {
          setAccessStatus('locked')
          setEnteredCode('')
          setKeypadActive(true)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [accessCode, enteredCode, keypadActive, unlocked])

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

      {accessCode && accessSign && keypad && (
        <DoorAccessPanel
          side={panelSide}
          title={collectionTitle}
          restrictedMessage={restrictedMessage}
          status={accessStatus}
          accessSign={accessSign}
          keypad={keypad}
        />
      )}

      {nearby && (
        <Html center position={[panelSide * 0.5, 1.45, width / 2]} zIndexRange={[30, 0]}>
          <div className="door-prompt">
            <span>Press E to {unlocked ? (open ? 'close' : 'open') : 'use keypad'}</span>
            {keypadActive && (
              <span className="door-code-entry">
                <strong>{enteredCode ? '•'.repeat(enteredCode.length) : 'Введите код'}</strong>
                <small>цифры · Enter — подтвердить · Esc — отмена</small>
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
