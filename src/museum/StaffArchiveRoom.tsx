import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { RepeatWrapping, SRGBColorSpace, Texture } from 'three'
import { ROOM, STAFF_ARCHIVE_ROOM, type RoomConfig } from './config'
import { useMuseumObjects } from './useMuseumObjects'

function tiledTexture(source: Texture, repeatX: number, repeatY: number) {
  const texture = source.clone()
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function StaffArchiveRoom() {
  const objects = useMuseumObjects()
  const room = objects.find(
    (object): object is RoomConfig => object.type === 'room' && object.id === 'staff-archive',
  )
  const [centerX, baseY, centerZ] = room?.position ?? [
    STAFF_ARCHIVE_ROOM.centerX,
    0,
    STAFF_ARCHIVE_ROOM.centerZ,
  ]
  const [width, height, depth] = room?.size ?? [
    STAFF_ARCHIVE_ROOM.width,
    STAFF_ARCHIVE_ROOM.height,
    STAFF_ARCHIVE_ROOM.depth,
  ]
  const wallThickness = room?.wallThickness ?? ROOM.wallThickness
  const maxX = centerX + width / 2
  const minZ = centerZ - depth / 2
  const maxZ = centerZ + depth / 2
  const [floorSource, wallSource] = useTexture(['/floor.jpg', '/wall.jpg'])
  const floorTexture = useMemo(
    () => tiledTexture(floorSource, width / 4, depth / 3),
    [depth, floorSource, width],
  )
  const longWallTexture = useMemo(
    () => tiledTexture(wallSource, width / 4, height / 3),
    [height, wallSource, width],
  )
  const endWallTexture = useMemo(
    () => tiledTexture(wallSource, depth / 3, height / 3),
    [depth, height, wallSource],
  )

  useEffect(
    () => () => {
      floorTexture.dispose()
      longWallTexture.dispose()
      endWallTexture.dispose()
    },
    [endWallTexture, floorTexture, longWallTexture],
  )

  return (
    <group>
      <mesh receiveShadow position={[centerX, baseY - 0.1, centerZ]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial map={floorTexture} color="#8b8170" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[centerX, baseY + height, centerZ]}>
        <boxGeometry args={[width, 0.18, depth]} />
        <meshStandardMaterial color="#c4c0b7" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[centerX, baseY + height / 2, minZ]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#77736c" roughness={0.96} />
      </mesh>
      <mesh receiveShadow position={[centerX, baseY + height / 2, maxZ]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#a7a198" roughness={0.96} />
      </mesh>
      <mesh receiveShadow position={[maxX, baseY + height / 2, centerZ]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial map={endWallTexture} color="#918c83" roughness={0.97} />
      </mesh>

      {[centerX - width * 0.25, centerX, centerX + width * 0.25].map((x) => (
        <mesh key={x} position={[x, baseY + height - 0.14, centerZ]}>
          <boxGeometry args={[1.5, 0.07, 0.22]} />
          <meshStandardMaterial color="#f0e3c7" emissive="#ead6aa" emissiveIntensity={1.4} />
        </mesh>
      ))}
      <rectAreaLight
        position={[centerX, baseY + height - 0.28, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={width * 0.8}
        height={depth * 0.65}
        intensity={2.15}
        color="#f6e6c8"
      />
    </group>
  )
}
