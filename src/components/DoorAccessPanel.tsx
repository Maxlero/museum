import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { DoorAccessSignConfig, KeypadConfig } from '../museum/config'

type AccessStatus = 'locked' | 'granted' | 'denied'

type DoorAccessPanelProps = {
  side: -1 | 1
  title: string
  restrictedMessage: string
  status: AccessStatus
  accessSign: DoorAccessSignConfig
  keypad: KeypadConfig
}

const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '×', '0', '↵']

function createSignTexture(title: string, message: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 384
  const context = canvas.getContext('2d')!

  context.fillStyle = '#171310'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#9b7945'
  context.lineWidth = 8
  context.strokeRect(13, 13, canvas.width - 26, canvas.height - 26)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#c9a568'
  context.font = '500 64px Georgia, serif'
  context.fillText(title, canvas.width / 2, 105)

  context.fillStyle = '#d8c7ad'
  context.font = 'italic 38px Georgia, serif'
  message.split('\n').forEach((line, index) => {
    context.fillText(line, canvas.width / 2, 215 + index * 54)
  })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function DoorAccessPanel({
  side,
  title,
  restrictedMessage,
  status,
  accessSign,
  keypad,
}: DoorAccessPanelProps) {
  const signTexture = useMemo(
    () => createSignTexture(title, restrictedMessage),
    [restrictedMessage, title],
  )
  const [signWidth, signHeight, signDepth] = accessSign.size
  const [keypadWidth, keypadHeight, keypadDepth] = keypad.size

  useEffect(() => () => signTexture.dispose(), [signTexture])

  return (
    <group>
      <group position={accessSign.position} rotation={accessSign.rotation}>
        <mesh castShadow>
          <boxGeometry args={[signDepth, signHeight, signWidth]} />
          <meshStandardMaterial color="#171310" roughness={0.48} metalness={0.28} />
        </mesh>
        <mesh position={[side * (signDepth / 2 + 0.002), 0, 0]} rotation={[0, side * Math.PI / 2, 0]}>
          <planeGeometry args={[signWidth, signHeight]} />
          <meshBasicMaterial map={signTexture} toneMapped={false} />
        </mesh>
      </group>

      <group position={keypad.position} rotation={keypad.rotation}>
        <mesh castShadow>
          <boxGeometry args={[keypadDepth, keypadHeight, keypadWidth]} />
          <meshStandardMaterial color="#211d1a" roughness={0.42} metalness={0.55} />
        </mesh>
        <group
          position={[side * (keypadDepth / 2 + 0.01), 0, 0]}
          rotation={[0, side * Math.PI / 2, 0]}
        >
          {keypadKeys.map((key, index) => {
            const column = index % 3
            const row = Math.floor(index / 3)
            const xStep = keypadWidth * 0.28
            const yStep = keypadHeight * 0.2
            return (
              <mesh
                key={`${key}-${index}`}
                castShadow
                position={[(column - 1) * xStep, (1.25 - row) * yStep - 0.02, 0]}
              >
                <boxGeometry args={[keypadWidth * 0.19, keypadHeight * 0.125, 0.025]} />
                <meshStandardMaterial color="#665b50" roughness={0.4} metalness={0.42} />
              </mesh>
            )
          })}
          <mesh position={[0, keypadHeight * 0.39, 0.015]}>
            <boxGeometry args={[keypadWidth * 0.74, keypadHeight * 0.11, 0.02]} />
            <meshStandardMaterial
              color={status === 'granted' ? '#4e9b67' : status === 'denied' ? '#b13b35' : '#d2a43c'}
              emissive={status === 'granted' ? '#194b29' : status === 'denied' ? '#5c100d' : '#6b4308'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}
