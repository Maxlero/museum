import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

type RoomSignProps = {
  room: string
  title: string
  position: [number, number, number]
  rotation: [number, number, number]
  width?: number
  height?: number
  lines?: Array<{
    text: string
    italic?: boolean
  }>
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number) {
  let size = initialSize
  while (size > 17) {
    context.font = `${size}px Georgia, serif`
    if (context.measureText(text).width <= maxWidth) break
    size -= 2
  }
  return size
}

function createSignTexture(
  room: string,
  title: string,
  lines: RoomSignProps['lines'],
  width: number,
  height: number,
) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = Math.max(360, Math.round(canvas.width * (height / width)))
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
  if (lines?.length) {
    if (room) {
      context.fillStyle = '#bda275'
      context.font = '30px Georgia, serif'
      context.fillText(room, canvas.width / 2, canvas.height * 0.15)
    }
    context.fillStyle = '#f2e6ce'
    const titleSize = fitText(context, title, canvas.width - 120, 48)
    context.font = `600 ${titleSize}px Georgia, serif`
    context.fillText(title, canvas.width / 2, canvas.height * (room ? 0.4 : 0.18))

    const firstY = canvas.height * (room ? 0.72 : 0.39)
    const availableHeight = canvas.height * (room ? 0.12 : 0.48)
    const lineStep = lines.length > 1 ? availableHeight / (lines.length - 1) : 0
    lines.forEach((line, index) => {
      const lineSize = fitText(context, line.text, canvas.width - 120, index === 0 ? 28 : 26)
      context.font = `${line.italic ? 'italic ' : ''}${lineSize}px Georgia, serif`
      context.fillStyle = index === 0 ? '#d2c0a0' : '#bbaa8d'
      context.fillText(line.text, canvas.width / 2, firstY + lineStep * index)
    })
  } else {
    context.fillStyle = '#bda275'
    context.font = '34px Georgia, serif'
    context.fillText(room, canvas.width / 2, canvas.height * 0.28)

    context.fillStyle = '#f2e6ce'
    context.font = '600 52px Georgia, serif'
    context.fillText(title, canvas.width / 2, canvas.height * 0.62)
  }

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
  lines,
}: RoomSignProps) {
  const texture = useMemo(
    () => createSignTexture(room, title, lines, width, height),
    [height, lines, room, title, width],
  )
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
