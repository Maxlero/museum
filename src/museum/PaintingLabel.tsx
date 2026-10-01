import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

type PaintingLabelProps = {
  title: string
  year?: string
  description?: string
  note?: string
  width?: number
  height?: number
  descriptionItalic?: boolean
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number) {
  let size = initialSize
  do {
    context.font = `${size}px Georgia, serif`
    if (context.measureText(text).width <= maxWidth) break
    size -= 2
  } while (size > 18)
  return size
}

function createLabelTexture({
  title,
  year,
  description,
  note,
  descriptionItalic,
}: Omit<PaintingLabelProps, 'width' | 'height'>, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = Math.max(320, Math.round(canvas.width * (height / width)))
  const context = canvas.getContext('2d')!

  context.fillStyle = '#eee9df'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#b8ad9b'
  context.lineWidth = 8
  context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)

  context.fillStyle = '#1c1a17'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  const titleSize = fitText(context, title, 1080, 48)
  context.font = `600 ${titleSize}px Georgia, serif`
  context.fillText(title, canvas.width / 2, canvas.height * 0.16)

  if (year) {
    context.font = 'italic 35px Georgia, serif'
    context.fillText(year, canvas.width / 2, canvas.height * 0.3)
  }

  if (description) {
    const descriptionSize = fitText(context, description, 1100, 31)
    context.font = `${descriptionItalic ? 'italic ' : ''}${descriptionSize}px Georgia, serif`
    context.fillText(description, canvas.width / 2, canvas.height * 0.54)
  }

  if (note) {
    const noteSize = fitText(context, note, 1100, 29)
    context.font = `italic ${noteSize}px Georgia, serif`
    context.fillStyle = '#49443c'
    context.fillText(note, canvas.width / 2, canvas.height * 0.79)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function PaintingLabel({ width = 2.7, height = 0.8, ...content }: PaintingLabelProps) {
  const texture = useMemo(
    () => createLabelTexture(content, width, height),
    [content.description, content.descriptionItalic, content.note, content.title, content.year, height, width],
  )

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group>
      <mesh castShadow position={[0, 0, -0.012]}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.055]} />
        <meshStandardMaterial color="#8e826e" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.88} />
      </mesh>
    </group>
  )
}
