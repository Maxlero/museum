import { useMemo } from 'react'
import { Object3D } from 'three'
import { ROOM } from './config'

type PaintingSpotlightProps = {
  position: [number, number, number]
  target: [number, number, number]
  intensity?: number
}

function PaintingSpotlight({ position, target: targetPosition, intensity = 32 }: PaintingSpotlightProps) {
  const target = useMemo(() => new Object3D(), [])

  return (
    <group>
      <spotLight
        position={position}
        target={target}
        color="#ffe0af"
        intensity={intensity}
        distance={10}
        angle={0.34}
        penumbra={0.82}
        decay={2}
      />
      <primitive object={target} position={targetPosition} />
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.095, 0.14, 0.22, 16]} />
        <meshStandardMaterial color="#272522" roughness={0.34} metalness={0.7} />
      </mesh>
    </group>
  )
}

export function MuseumLighting() {
  return (
    <>
      <rectAreaLight
        position={[0, ROOM.height + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={9.2}
        height={10.6}
        intensity={4.2}
        color="#fff1cf"
      />

      <PaintingSpotlight position={[-3.7, 4.62, -5.4]} target={[-3.7, 2.15, -7.75]} />
      <PaintingSpotlight position={[0, 4.62, -5.25]} target={[0, 2.2, -7.75]} intensity={38} />
      <PaintingSpotlight position={[3.7, 4.62, -5.4]} target={[3.7, 2.15, -7.75]} />
      <PaintingSpotlight position={[-4.9, 4.6, -2.4]} target={[-6.72, 2.15, -2.4]} intensity={26} />
      <PaintingSpotlight position={[4.9, 4.6, 0.6]} target={[6.72, 2.15, 0.6]} intensity={26} />
    </>
  )
}
