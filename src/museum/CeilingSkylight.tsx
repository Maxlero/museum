import { useEffect, useMemo } from 'react'
import { CanvasTexture, DoubleSide, SRGBColorSpace } from 'three'

type CeilingFrameProps = {
  width: number
  depth: number
  thickness: number
  height: number
  color: string
}

function CeilingFrame({ width, depth, thickness, height, color }: CeilingFrameProps) {
  return (
    <group position={[0, height, 0]}>
      <mesh castShadow receiveShadow position={[0, 0, -depth / 2]}>
        <boxGeometry args={[width, thickness, thickness]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, depth / 2]}>
        <boxGeometry args={[width, thickness, thickness]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh castShadow receiveShadow position={[-width / 2, 0, 0]}>
        <boxGeometry args={[thickness, thickness, depth]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh castShadow receiveShadow position={[width / 2, 0, 0]}>
        <boxGeometry args={[thickness, thickness, depth]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
    </group>
  )
}

function createSkyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')!
  const sky = context.createLinearGradient(0, 0, 0, canvas.height)
  sky.addColorStop(0, '#5e9fce')
  sky.addColorStop(0.55, '#9bc7df')
  sky.addColorStop(1, '#e7f0ed')
  context.fillStyle = sky
  context.fillRect(0, 0, canvas.width, canvas.height)

  const sun = context.createRadialGradient(770, 250, 10, 770, 250, 220)
  sun.addColorStop(0, 'rgba(255,250,214,1)')
  sun.addColorStop(0.22, 'rgba(255,239,181,.72)')
  sun.addColorStop(1, 'rgba(255,234,172,0)')
  context.fillStyle = sun
  context.fillRect(520, 0, 504, 520)

  context.fillStyle = 'rgba(255,255,255,.52)'
  ;[
    [130, 230, 220, 70],
    [420, 650, 310, 88],
    [830, 510, 235, 72],
    [150, 870, 300, 82],
  ].forEach(([x, y, width, height]) => {
    context.beginPath()
    context.ellipse(x, y, width, height, -0.12, 0, Math.PI * 2)
    context.ellipse(x + width * 0.58, y - 22, width * 0.68, height * 0.82, 0.08, 0, Math.PI * 2)
    context.fill()
  })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

type CeilingSkylightProps = {
  centerX?: number
  centerZ?: number
  baseY?: number
  width?: number
  depth?: number
  height?: number
}

export function CeilingSkylight({
  centerX = 0,
  centerZ = 0,
  baseY = 0,
  width = 14,
  depth = 16,
  height = 5,
}: CeilingSkylightProps) {
  const openingWidth = width * 0.7
  const openingDepth = depth * 0.7
  const sideBorder = (width - openingWidth) / 2
  const endBorder = (depth - openingDepth) / 2
  const skyTexture = useMemo(createSkyTexture, [])
  const verticalBars = useMemo(
    () => Array.from({ length: 5 }, (_, index) => -openingWidth / 3 + index * (openingWidth / 6)),
    [openingWidth],
  )
  const horizontalBars = useMemo(
    () => Array.from({ length: 5 }, (_, index) => -openingDepth / 3 + index * (openingDepth / 6)),
    [openingDepth],
  )

  useEffect(() => () => skyTexture.dispose(), [skyTexture])

  return (
    <group position={[centerX, baseY, centerZ]}>
      {/* Потолочные панели оставляют в центре большую прямоугольную нишу. */}
      <mesh receiveShadow position={[0, height, -(depth - endBorder) / 2]}>
        <boxGeometry args={[width, 0.18, endBorder]} />
        <meshStandardMaterial color="#d7d2c9" roughness={0.92} />
      </mesh>
      <mesh receiveShadow position={[0, height, (depth - endBorder) / 2]}>
        <boxGeometry args={[width, 0.18, endBorder]} />
        <meshStandardMaterial color="#d7d2c9" roughness={0.92} />
      </mesh>
      <mesh receiveShadow position={[-(width - sideBorder) / 2, height, 0]}>
        <boxGeometry args={[sideBorder, 0.18, openingDepth]} />
        <meshStandardMaterial color="#d7d2c9" roughness={0.92} />
      </mesh>
      <mesh receiveShadow position={[(width - sideBorder) / 2, height, 0]}>
        <boxGeometry args={[sideBorder, 0.18, openingDepth]} />
        <meshStandardMaterial color="#d7d2c9" roughness={0.92} />
      </mesh>

      {/* Три спокойных ступени вместо сложной лепнины. */}
      <CeilingFrame width={width - 0.32} depth={depth - 0.32} thickness={0.22} height={height - 0.13} color="#c9c2b6" />
      <CeilingFrame width={width - 0.68} depth={depth - 0.68} thickness={0.18} height={height - 0.22} color="#ded8ce" />
      <CeilingFrame width={openingWidth + 0.5} depth={openingDepth + 0.5} thickness={0.24} height={height - 0.31} color="#bdb5a8" />

      {/* Светлое небо закрывает чёрный фон над нишей. */}
      <mesh position={[0, height + 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[openingWidth, openingDepth]} />
        <meshBasicMaterial map={skyTexture} toneMapped={false} side={DoubleSide} />
      </mesh>

      {/* Матовый стеклянный плафон. */}
      <mesh position={[0, height - 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[openingWidth, openingDepth]} />
        <meshPhysicalMaterial
          color="#f4ead1"
          emissive="#d9c9a4"
          emissiveIntensity={0.22}
          roughness={0.72}
          metalness={0}
          transmission={0.18}
          transparent
          opacity={0.68}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Наружная металлическая рама и сетка поверх стекла. */}
      <CeilingFrame width={openingWidth} depth={openingDepth} thickness={0.11} height={height - 0.22} color="#403a32" />
      <group position={[0, height - 0.23, 0]}>
        {verticalBars.map((x) => (
          <mesh key={`vertical-${x}`} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.055, 0.075, openingDepth]} />
            <meshStandardMaterial color="#39352f" roughness={0.38} metalness={0.72} />
          </mesh>
        ))}
        {horizontalBars.map((z) => (
          <mesh key={`horizontal-${z}`} position={[0, -0.002, z]} castShadow>
            <boxGeometry args={[openingWidth, 0.075, 0.055]} />
            <meshStandardMaterial color="#39352f" roughness={0.38} metalness={0.72} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
