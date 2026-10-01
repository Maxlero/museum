import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'

export type FramePreset = 'simpleGold' | 'ornateGold' | 'darkWood'

export type MuseumPaintingProps = {
  image: string
  width?: number
  height?: number
  framePreset?: FramePreset
  title?: string
  subtitle?: string
  description?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const FRAME_PRESETS = {
  simpleGold: {
    outerColor: '#8b6828',
    innerColor: '#d4ae55',
    thickness: 0.075,
    depth: 0.075,
    metalness: 0.38,
    roughness: 0.38,
  },
  ornateGold: {
    outerColor: '#78511f',
    innerColor: '#d8b967',
    thickness: 0.11,
    depth: 0.095,
    metalness: 0.42,
    roughness: 0.32,
  },
  darkWood: {
    outerColor: '#382217',
    innerColor: '#9c7247',
    thickness: 0.095,
    depth: 0.08,
    metalness: 0.04,
    roughness: 0.68,
  },
} satisfies Record<FramePreset, {
  outerColor: string
  innerColor: string
  thickness: number
  depth: number
  metalness: number
  roughness: number
}>

type FrameProps = {
  width: number
  height: number
  preset: FramePreset
}

function Frame({ width, height, preset }: FrameProps) {
  const config = FRAME_PRESETS[preset]
  const { outerColor, innerColor, thickness, depth, metalness, roughness } = config
  const outerWidth = width + thickness * 2
  const outerHeight = height + thickness * 2
  const trim = Math.max(0.018, thickness * 0.24)
  const trimZ = depth / 2 + trim / 2 + 0.002

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, height / 2 + thickness / 2, 0]}>
        <boxGeometry args={[outerWidth, thickness, depth]} />
        <meshStandardMaterial color={outerColor} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -height / 2 - thickness / 2, 0]}>
        <boxGeometry args={[outerWidth, thickness, depth]} />
        <meshStandardMaterial color={outerColor} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh castShadow receiveShadow position={[-width / 2 - thickness / 2, 0, 0]}>
        <boxGeometry args={[thickness, outerHeight, depth]} />
        <meshStandardMaterial color={outerColor} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh castShadow receiveShadow position={[width / 2 + thickness / 2, 0, 0]}>
        <boxGeometry args={[thickness, outerHeight, depth]} />
        <meshStandardMaterial color={outerColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Кант слегка заходит на изображение, поэтому между ним и рамой нет щели. */}
      <mesh castShadow position={[0, height / 2 - trim / 2, trimZ]}>
        <boxGeometry args={[width, trim, trim]} />
        <meshStandardMaterial color={innerColor} metalness={metalness} roughness={roughness * 0.72} />
      </mesh>
      <mesh castShadow position={[0, -height / 2 + trim / 2, trimZ]}>
        <boxGeometry args={[width, trim, trim]} />
        <meshStandardMaterial color={innerColor} metalness={metalness} roughness={roughness * 0.72} />
      </mesh>
      <mesh castShadow position={[-width / 2 + trim / 2, 0, trimZ]}>
        <boxGeometry args={[trim, height, trim]} />
        <meshStandardMaterial color={innerColor} metalness={metalness} roughness={roughness * 0.72} />
      </mesh>
      <mesh castShadow position={[width / 2 - trim / 2, 0, trimZ]}>
        <boxGeometry args={[trim, height, trim]} />
        <meshStandardMaterial color={innerColor} metalness={metalness} roughness={roughness * 0.72} />
      </mesh>
    </group>
  )
}

export function MuseumPainting({
  image,
  width = 1.2,
  height = 1.6,
  framePreset = 'simpleGold',
  title,
  subtitle,
  description,
  position = [0, 1.8, 0],
  rotation = [0, 0, 0],
}: MuseumPaintingProps) {
  const texture = useLoader(TextureLoader, image)
  texture.colorSpace = SRGBColorSpace
  const frameDepth = FRAME_PRESETS[framePreset].depth
  const paintingZ = frameDepth / 2 + 0.005

  return (
    <group
      name={title ?? 'Museum painting'}
      position={position}
      rotation={rotation}
      userData={{
        type: 'museum-painting',
        title,
        subtitle,
        description,
      }}
    >
      <mesh castShadow receiveShadow position={[0, 0, -0.012]}>
        <boxGeometry args={[width, height, 0.03]} />
        <meshStandardMaterial color="#15120f" roughness={0.9} />
      </mesh>

      <mesh castShadow position={[0, 0, paintingZ]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.78} metalness={0} />
      </mesh>

      <Frame width={width} height={height} preset={framePreset} />
    </group>
  )
}
