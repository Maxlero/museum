import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { RepeatWrapping, SRGBColorSpace, Texture } from 'three'
import { CeilingSkylight } from './CeilingSkylight'
import { DECOMMISSIONED_ROOM, ROOM, type DoorConfig, type RoomConfig } from './config'
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

export function DecommissionedWing() {
  const objects = useMuseumObjects()
  const room = objects.find(
    (object): object is RoomConfig => object.type === 'room' && object.id === 'decommissioned-wing',
  )
  const archiveDoor = objects.find(
    (object): object is DoorConfig =>
      object.type === 'door' && object.id === 'decommissioned-to-staff-archive',
  )
  const [centerX, baseY, centerZ] = room?.position ?? [
    DECOMMISSIONED_ROOM.centerX,
    0,
    DECOMMISSIONED_ROOM.centerZ,
  ]
  const [width, height, depth] = room?.size ?? [
    DECOMMISSIONED_ROOM.width,
    DECOMMISSIONED_ROOM.height,
    DECOMMISSIONED_ROOM.depth,
  ]
  const wallThickness = room?.wallThickness ?? ROOM.wallThickness
  const minX = centerX - width / 2
  const maxX = centerX + width / 2
  const farZ = centerZ - depth / 2
  const nearZ = centerZ + depth / 2
  const archiveDoorStart = archiveDoor?.position[2] ?? centerZ + 2
  const archiveDoorWidth = archiveDoor?.width ?? 1.5
  const archiveDoorHeight = archiveDoor?.height ?? 2.25
  const archiveDoorEnd = archiveDoorStart + archiveDoorWidth
  const rightWallBeforeDoor = archiveDoorStart - farZ
  const rightWallAfterDoor = nearZ - archiveDoorEnd
  const [floorSource, wallSource] = useTexture(['/floor.jpg', '/wall.jpg'])
  const floorTexture = useMemo(
    () => tiledTexture(floorSource, width / 4, depth / 4),
    [depth, floorSource, width],
  )
  const backWallTexture = useMemo(
    () => tiledTexture(wallSource, width / 4, height / 3),
    [height, wallSource, width],
  )
  const sideWallTexture = useMemo(
    () => tiledTexture(wallSource, depth / 4, height / 3),
    [depth, height, wallSource],
  )

  useEffect(
    () => () => {
      floorTexture.dispose()
      backWallTexture.dispose()
      sideWallTexture.dispose()
    },
    [backWallTexture, floorTexture, sideWallTexture],
  )

  return (
    <group>
      <mesh receiveShadow position={[centerX, baseY - 0.1, centerZ]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial map={floorTexture} color="#756c5c" roughness={0.94} />
      </mesh>
      {room?.skylight !== false ? (
        <CeilingSkylight
          centerX={centerX}
          centerZ={centerZ}
          baseY={baseY}
          width={width}
          depth={depth}
          height={height}
        />
      ) : (
        <mesh receiveShadow position={[centerX, baseY + height, centerZ]}>
          <boxGeometry args={[width, 0.18, depth]} />
          <meshStandardMaterial color="#595854" roughness={0.96} />
        </mesh>
      )}
      <mesh receiveShadow position={[minX, baseY + height / 2, centerZ]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial map={sideWallTexture} color="#817d74" roughness={0.98} />
      </mesh>
      <mesh
        receiveShadow
        position={[maxX, baseY + height / 2, farZ + rightWallBeforeDoor / 2]}
      >
        <boxGeometry args={[wallThickness, height, rightWallBeforeDoor]} />
        <meshStandardMaterial map={sideWallTexture} color="#817d74" roughness={0.98} />
      </mesh>
      <mesh
        receiveShadow
        position={[maxX, baseY + height / 2, archiveDoorEnd + rightWallAfterDoor / 2]}
      >
        <boxGeometry args={[wallThickness, height, rightWallAfterDoor]} />
        <meshStandardMaterial map={sideWallTexture} color="#817d74" roughness={0.98} />
      </mesh>
      <mesh
        receiveShadow
        position={[
          maxX,
          baseY + archiveDoorHeight + (height - archiveDoorHeight) / 2,
          archiveDoorStart + archiveDoorWidth / 2,
        ]}
      >
        <boxGeometry args={[wallThickness, height - archiveDoorHeight, archiveDoorWidth]} />
        <meshStandardMaterial map={sideWallTexture} color="#817d74" roughness={0.98} />
      </mesh>
      <mesh receiveShadow position={[centerX, baseY + height / 2, farZ]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial map={backWallTexture} color="#77746d" roughness={0.98} />
      </mesh>

      <rectAreaLight
        position={[centerX, baseY + height - 0.3, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={width * 0.62}
        height={depth * 0.55}
        intensity={2.7}
        color="#fff0d1"
      />
    </group>
  )
}
