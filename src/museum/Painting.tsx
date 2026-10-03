import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { PaintingConfig } from './config'
import { LivingPainting } from './LivingPainting'
import { PaintingLabel } from './PaintingLabel'
import { createPaintingTexture } from './paintingTexture'

type PaintingProps = { config: PaintingConfig }

const DEFAULT_PALETTE: [string, string, string] = ['#24313a', '#a7795d', '#e2c89a']

function ImageArtwork({ image, size }: { image: string; size: [number, number] }) {
  const texture = useTexture(image)
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh position={[0, 0, 0.052]}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} roughness={0.74} />
    </mesh>
  )
}

function ProceduralArtwork({
  palette,
  size,
}: {
  palette: [string, string, string]
  size: [number, number]
}) {
  const texture = useMemo(() => createPaintingTexture(palette), [palette])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={[0, 0, 0.052]}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} roughness={0.75} />
    </mesh>
  )
}

function PlaceholderArtwork({ text, size }: { text: string; size: [number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 800
    const context = canvas.getContext('2d')!
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#252424')
    gradient.addColorStop(1, '#111010')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(205, 174, 112, .35)'
    context.lineWidth = 5
    context.strokeRect(28, 28, canvas.width - 56, canvas.height - 56)
    context.fillStyle = '#c5a66d'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = '280px Georgia, serif'
    context.fillText(text, canvas.width / 2, canvas.height / 2 - 10)
    const result = new CanvasTexture(canvas)
    result.colorSpace = SRGBColorSpace
    return result
  }, [text])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={[0, 0, 0.052]}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} roughness={0.82} />
    </mesh>
  )
}

function OrnateFrame({ image, size }: { image: string; size: [number, number] }) {
  const texture = useTexture(image)
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh castShadow position={[0, 0, 0.13]}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.04}
        toneMapped={false}
      />
    </mesh>
  )
}

export function Painting({ config }: PaintingProps) {
  const {
    title,
    year,
    description,
    note,
    position,
    rotation,
    size,
    image,
    palette = DEFAULT_PALETTE,
    living,
    frame = 'classic',
    frameImage,
    frameSize = [4.05, 4.05],
    labelPosition,
    labelSize = [2.75, 0.8],
    descriptionItalic,
    placeholderText,
    labelLines,
    video,
  } = config
  const hasDetailedLabel = Boolean(year || description || note || labelLines?.length)
  const resolvedLabelPosition: [number, number, number] = labelPosition ?? [
    0,
    -size[1] / 2 - (frame === 'ornate' ? 1.06 : 0.62),
    0.055,
  ]

  return (
    <group name={title} position={position} rotation={rotation}>
      {frame === 'ornate' ? (
        frameImage && <OrnateFrame image={frameImage} size={frameSize} />
      ) : (
        <>
          <mesh castShadow={!video} position={[0, 0, -0.025]}>
            <boxGeometry args={[size[0] + 0.28, size[1] + 0.28, 0.12]} />
            <meshStandardMaterial color="#24150c" roughness={0.42} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[size[0] + 0.12, size[1] + 0.12]} />
            <meshStandardMaterial color="#c29a4d" roughness={0.3} metalness={0.45} />
          </mesh>
        </>
      )}
      {living ? (
        <LivingPainting size={size} palette={palette} video={video} />
      ) : image ? (
        <ImageArtwork image={image} size={size} />
      ) : placeholderText ? (
        <PlaceholderArtwork text={placeholderText} size={size} />
      ) : (
        <ProceduralArtwork palette={palette} size={size} />
      )}
      {hasDetailedLabel ? (
        <group position={resolvedLabelPosition}>
          <PaintingLabel
            title={title}
            year={year}
            description={description}
            note={note}
            descriptionItalic={descriptionItalic}
            labelLines={labelLines}
            castShadow={!video}
            width={labelSize[0]}
            height={labelSize[1]}
          />
        </group>
      ) : (
        <mesh position={[0, -size[1] / 2 - 0.24, 0.035]}>
          <boxGeometry args={[0.7, 0.15, 0.035]} />
          <meshStandardMaterial color="#a48145" roughness={0.38} metalness={0.52} />
        </mesh>
      )}
    </group>
  )
}
