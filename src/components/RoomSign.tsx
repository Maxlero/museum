import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

type RoomSignProps = {
  room: string
  title: string
  position: [number, number, number]
  rotation: [number, number, number]
  width?: number
  height?: number
}

function createSignTexture(room: string, title: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 360
  const context = canvas.getContext('2d')!

  context.fillStyle = '#211b14'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#a9864c'
  context.lineWidth = 10
  context.strokeRect(12, 12, canvas.width - 24, canvas.height - 24)
  context.strokeStyle = 'rgba(207, 173, 106, .45)'
  context.lineWidth = 2
  context.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#bda275'
  context.font = '34px Georgia, serif'
  context.fillText(room, canvas.width / 2, 102)

  context.fillStyle = '#f2e6ce'
  context.font = '600 52px Georgia, serif'
  context.fillText(title, canvas.width / 2, 222)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function RoomSign({
  room,
  title,
  position,
  rotation,
  width = 2.05,
  height = 0.62,
}: RoomSignProps) {
  const texture = useMemo(() => createSignTexture(room, title), [room, title])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[0, 0, -0.025]}>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.07]} />
        <meshStandardMaterial color="#6f552f" roughness={0.38} metalness={0.48} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}
