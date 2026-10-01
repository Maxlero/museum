import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { RepeatWrapping, SRGBColorSpace, Texture } from 'three'
import { ROOM, ROOM_TWO } from './config'
import { CeilingSkylight } from './CeilingSkylight'

function tiledTexture(source: Texture, repeatX: number, repeatY: number) {
  const texture = source.clone()
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function SecondRoom() {
  const { centerX, width, depth, height } = ROOM_TWO
  const [floorSource, wallSource] = useTexture(['/floor.jpg', '/wall.jpg'])
  const floorTexture = useMemo(() => tiledTexture(floorSource, width / 5, depth / 5), [depth, floorSource, width])
  const longWallTexture = useMemo(() => tiledTexture(wallSource, width / 4, height / 4), [height, wallSource, width])
  const sideWallTexture = useMemo(() => tiledTexture(wallSource, depth / 4, height / 4), [depth, height, wallSource])

  useEffect(
    () => () => {
      floorTexture.dispose()
      longWallTexture.dispose()
      sideWallTexture.dispose()
    },
    [floorTexture, longWallTexture, sideWallTexture],
  )

  return (
    <group>
      <mesh receiveShadow position={[centerX, -0.1, 0]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial map={floorTexture} color="#c9aa7f" roughness={0.78} />
      </mesh>
      <CeilingSkylight centerX={centerX} />
      <mesh receiveShadow position={[centerX, height / 2, -depth / 2]}>
        <boxGeometry args={[width, height, ROOM.wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[centerX, height / 2, depth / 2]}>
        <boxGeometry args={[width, height, ROOM.wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[centerX + width / 2, height / 2, 0]}>
        <boxGeometry args={[ROOM.wallThickness, height, depth]} />
        <meshStandardMaterial map={sideWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>

      <rectAreaLight
        position={[centerX, height - 0.18, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={8}
        height={10}
        intensity={2.8}
        color="#fff0d1"
      />
    </group>
  )
}
