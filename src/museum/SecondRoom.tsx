import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { RepeatWrapping, SRGBColorSpace, Texture } from 'three'
import { ROOM, ROOM_TWO, type DoorConfig, type RoomConfig } from './config'
import { CeilingSkylight } from './CeilingSkylight'
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

export function SecondRoom() {
  const objects = useMuseumObjects()
  const room = objects.find(
    (object): object is RoomConfig => object.type === 'room' && object.id === 'room-two',
  )
  const [centerX, baseY, centerZ] = room?.position ?? [ROOM_TWO.centerX, 0, 0]
  const [width, height, depth] = room?.size ?? [ROOM_TWO.width, ROOM_TWO.height, ROOM_TWO.depth]
  const wallThickness = room?.wallThickness ?? ROOM.wallThickness
  const privateDoor = objects.find(
    (object): object is DoorConfig => object.type === 'door' && object.id === 'room-two-to-private-collection',
  )
  const decommissionedDoor = objects.find(
    (object): object is DoorConfig =>
      object.type === 'door' && object.id === 'room-two-to-decommissioned-wing',
  )
  const activeCollectionDoor = objects.find(
    (object): object is DoorConfig =>
      object.type === 'door' && object.id === 'room-two-to-active-collection',
  )
  const roomMinX = centerX - width / 2
  const roomMaxX = centerX + width / 2
  const doorwayStart = privateDoor?.position[0] ?? centerX - 0.75
  const doorwayWidth = privateDoor?.width ?? 1.5
  const doorwayHeight = privateDoor?.height ?? 2.25
  const doorwayEnd = doorwayStart + doorwayWidth
  const beforeDoorWidth = doorwayStart - roomMinX
  const afterDoorWidth = roomMaxX - doorwayEnd
  const backDoorStart = decommissionedDoor?.position[0] ?? centerX - 0.75
  const backDoorWidth = decommissionedDoor?.width ?? 1.5
  const backDoorHeight = decommissionedDoor?.height ?? 2.25
  const backDoorEnd = backDoorStart + backDoorWidth
  const beforeBackDoorWidth = backDoorStart - roomMinX
  const afterBackDoorWidth = roomMaxX - backDoorEnd
  const sideDoorStart = activeCollectionDoor?.position[2] ?? centerZ - 1.5
  const sideDoorWidth = activeCollectionDoor?.width ?? 1.5
  const sideDoorHeight = activeCollectionDoor?.height ?? 2.25
  const sideDoorEnd = sideDoorStart + sideDoorWidth
  const beforeSideDoorDepth = sideDoorStart - (centerZ - depth / 2)
  const afterSideDoorDepth = centerZ + depth / 2 - sideDoorEnd
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
      <mesh receiveShadow position={[centerX, baseY - 0.1, centerZ]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial map={floorTexture} color="#c9aa7f" roughness={0.78} />
      </mesh>
      {room?.skylight !== false && (
        <CeilingSkylight centerX={centerX} centerZ={centerZ} baseY={baseY} width={width} depth={depth} height={height} />
      )}
      <mesh
        receiveShadow
        position={[roomMinX + beforeBackDoorWidth / 2, baseY + height / 2, centerZ - depth / 2]}
      >
        <boxGeometry args={[beforeBackDoorWidth, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh
        receiveShadow
        position={[backDoorEnd + afterBackDoorWidth / 2, baseY + height / 2, centerZ - depth / 2]}
      >
        <boxGeometry args={[afterBackDoorWidth, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh
        receiveShadow
        position={[
          backDoorStart + backDoorWidth / 2,
          baseY + backDoorHeight + (height - backDoorHeight) / 2,
          centerZ - depth / 2,
        ]}
      >
        <boxGeometry args={[backDoorWidth, height - backDoorHeight, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[roomMinX + beforeDoorWidth / 2, baseY + height / 2, centerZ + depth / 2]}>
        <boxGeometry args={[beforeDoorWidth, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[doorwayEnd + afterDoorWidth / 2, baseY + height / 2, centerZ + depth / 2]}>
        <boxGeometry args={[afterDoorWidth, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh
        receiveShadow
        position={[
          doorwayStart + doorwayWidth / 2,
          baseY + doorwayHeight + (height - doorwayHeight) / 2,
          centerZ + depth / 2,
        ]}
      >
        <boxGeometry args={[doorwayWidth, height - doorwayHeight, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh
        receiveShadow
        position={[centerX + width / 2, baseY + height / 2, centerZ - depth / 2 + beforeSideDoorDepth / 2]}
      >
        <boxGeometry args={[wallThickness, height, beforeSideDoorDepth]} />
        <meshStandardMaterial map={sideWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh
        receiveShadow
        position={[centerX + width / 2, baseY + height / 2, sideDoorEnd + afterSideDoorDepth / 2]}
      >
        <boxGeometry args={[wallThickness, height, afterSideDoorDepth]} />
        <meshStandardMaterial map={sideWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>
      <mesh
        receiveShadow
        position={[
          centerX + width / 2,
          baseY + sideDoorHeight + (height - sideDoorHeight) / 2,
          sideDoorStart + sideDoorWidth / 2,
        ]}
      >
        <boxGeometry args={[wallThickness, height - sideDoorHeight, sideDoorWidth]} />
        <meshStandardMaterial map={sideWallTexture} color="#c8c1b6" roughness={0.94} />
      </mesh>

      <rectAreaLight
        position={[centerX, baseY + height - 0.18, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={8}
        height={10}
        intensity={2.8}
        color="#fff0d1"
      />
    </group>
  )
}
