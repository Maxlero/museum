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
  castShadow?: boolean
  labelLines?: Array<{
    text: string
    italic?: boolean
    bold?: boolean
  }>
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  fontStyle = '',
) {
  let size = initialSize
  do {
    context.font = `${fontStyle}${size}px Georgia, serif`
    if (context.measureText(text).width <= maxWidth) break
    size -= 2
  } while (size > 18)
  return size
}

type StyledLabelLine = NonNullable<PaintingLabelProps['labelLines']>[number]

function wrapLabelLine(
  context: CanvasRenderingContext2D,
  line: StyledLabelLine,
  fontSize: number,
  maxWidth: number,
) {
  const fontStyle = `${line.italic ? 'italic ' : ''}${line.bold ? '700 ' : ''}`
  context.font = `${fontStyle}${fontSize}px Georgia, serif`
  const wrapped: string[] = []

  line.text.split('\n').forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/)
    let current = ''
    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word
      if (current && context.measureText(candidate).width > maxWidth) {
        wrapped.push(current)
        current = word
      } else {
        current = candidate
      }
    })
    if (current) wrapped.push(current)
  })

  return wrapped.map((text, index) => ({
    ...line,
    text,
    paragraphEnd: index === wrapped.length - 1,
  }))
}

function createLabelTexture({
  title,
  year,
  description,
  note,
  descriptionItalic,
  labelLines,
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
  let usedContentBottom = canvas.height

  const titleSize = fitText(context, title, 1080, 48)
  context.font = `600 ${titleSize}px Georgia, serif`
  let contentCursor = 54
  context.fillText(title, canvas.width / 2, contentCursor + titleSize / 2)
  contentCursor += titleSize + 18

  if (year) {
    context.font = 'italic 35px Georgia, serif'
    context.fillText(year, canvas.width / 2, contentCursor + 17.5)
    contentCursor += 35 + 24
  }

  if (labelLines?.length) {
    const contentTop = contentCursor + 10
    const contentBottom = canvas.height - 48
    const availableHeight = contentBottom - contentTop
    let bodySize = 38
    let wrappedLines = labelLines.flatMap((line) => wrapLabelLine(context, line, bodySize, 1040))
    let lineHeight = bodySize * 1.08
    let paragraphGap = bodySize * 0.34
    let contentHeight = wrappedLines.length * lineHeight +
      wrappedLines.filter((line) => line.paragraphEnd).length * paragraphGap

    while (contentHeight > availableHeight && bodySize > 26) {
      bodySize -= 1
      wrappedLines = labelLines.flatMap((line) => wrapLabelLine(context, line, bodySize, 1040))
      lineHeight = bodySize * 1.08
      paragraphGap = bodySize * 0.34
      contentHeight = wrappedLines.length * lineHeight +
        wrappedLines.filter((line) => line.paragraphEnd).length * paragraphGap
    }

    let currentY = contentTop + lineHeight / 2
    wrappedLines.forEach((line) => {
      const fontStyle = `${line.italic ? 'italic ' : ''}${line.bold ? '700 ' : ''}`
      context.font = `${fontStyle}${bodySize}px Georgia, serif`
      context.fillStyle = line.bold ? '#262019' : '#49443c'
      context.fillText(line.text, canvas.width / 2, currentY)
      currentY += lineHeight + (line.paragraphEnd ? paragraphGap : 0)
    })
    usedContentBottom = currentY - paragraphGap - lineHeight / 2 + 18
  } else if (description) {
    const descriptionSize = fitText(context, description, 1100, 31)
    context.font = `${descriptionItalic ? 'italic ' : ''}${descriptionSize}px Georgia, serif`
    context.fillText(description, canvas.width / 2, canvas.height * 0.54)
  }

  if (note && !labelLines?.length) {
    const noteSize = fitText(context, note, 1100, 29)
    context.font = `italic ${noteSize}px Georgia, serif`
    context.fillStyle = '#49443c'
    context.fillText(note, canvas.width / 2, canvas.height * 0.79)
  }

  const croppedHeight = labelLines?.length
    ? Math.min(canvas.height, Math.max(320, Math.ceil(usedContentBottom + 26)))
    : canvas.height
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = canvas.width
  outputCanvas.height = croppedHeight
  const outputContext = outputCanvas.getContext('2d')!
  outputContext.drawImage(canvas, 0, 0, canvas.width, croppedHeight, 0, 0, canvas.width, croppedHeight)
  outputContext.strokeStyle = '#b8ad9b'
  outputContext.lineWidth = 8
  outputContext.strokeRect(4, 4, outputCanvas.width - 8, outputCanvas.height - 8)

  const texture = new CanvasTexture(outputCanvas)
  texture.colorSpace = SRGBColorSpace
  return {
    texture,
    displayHeight: width * (croppedHeight / canvas.width),
  }
}

export function PaintingLabel({ width = 2.7, height = 0.8, castShadow = true, ...content }: PaintingLabelProps) {
  const renderedLabel = useMemo(
    () => createLabelTexture(content, width, height),
    [
      content.description,
      content.descriptionItalic,
      content.labelLines,
      content.note,
      content.title,
      content.year,
      height,
      width,
    ],
  )
  const { texture, displayHeight } = renderedLabel
  const verticalOffset = (height - displayHeight) / 2

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <group position={[0, verticalOffset, 0]}>
      <mesh castShadow={castShadow} position={[0, 0, -0.012]}>
        <boxGeometry args={[width + 0.06, displayHeight + 0.06, 0.055]} />
        <meshStandardMaterial color="#8e826e" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width, displayHeight]} />
        <meshStandardMaterial map={texture} roughness={0.88} />
      </mesh>
    </group>
  )
}
