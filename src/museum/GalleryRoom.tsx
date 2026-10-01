import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { RepeatWrapping, SRGBColorSpace, Texture } from 'three'
import { MuseumPainting } from '../components/MuseumPainting'
import { RoomSign } from '../components/RoomSign'
import { CeilingSkylight } from './CeilingSkylight'
import {
  DOORWAY,
  ROOM,
  type DoorConfig,
  type PaintingConfig,
  type RoomConfig,
  type RoomSignConfig,
} from './config'
import { Painting } from './Painting'
import { PaintingLabel } from './PaintingLabel'
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

function ConfiguredMuseumPainting({ painting }: { painting: PaintingConfig }) {
  if (!painting.image || !painting.framePreset) return null

  const [width, height] = painting.size
  const hasLabel = Boolean(painting.year || painting.note)
  const labelPosition = painting.labelPosition ?? [0, -height / 2 - 0.62, 0.055]
  const labelSize = painting.labelSize ?? [2.75, 0.8]

  return (
    <group position={painting.position} rotation={painting.rotation}>
      <MuseumPainting
        image={painting.image}
        width={width}
        height={height}
        framePreset={painting.framePreset}
        title={painting.title}
        subtitle={painting.subtitle ?? painting.year}
        description={painting.description}
      />
      {hasLabel && (
        <group position={labelPosition}>
          <PaintingLabel
            title={painting.title}
            year={painting.year}
            description={painting.description}
            note={painting.note}
            descriptionItalic={painting.descriptionItalic}
            width={labelSize[0]}
            height={labelSize[1]}
          />
        </group>
      )}
    </group>
  )
}

export function GalleryRoom() {
  const objects = useMuseumObjects()
  const room = objects.find(
    (object): object is RoomConfig => object.type === 'room' && object.id === 'room-one',
  )
  const [centerX, baseY, centerZ] = room?.position ?? [0, 0, 0]
  const [width, height, depth] = room?.size ?? [ROOM.width, ROOM.height, ROOM.depth]
  const wallThickness = room?.wallThickness ?? ROOM.wallThickness
  const connectingDoor = objects.find(
    (object): object is DoorConfig => object.type === 'door' && object.id === 'room-one-to-room-two',
  )
  const doorwayStart = connectingDoor?.position[2] ?? centerZ + DOORWAY.centerZ - DOORWAY.width / 2
  const doorwayWidth = connectingDoor?.width ?? DOORWAY.width
  const doorwayHeight = connectingDoor?.height ?? DOORWAY.height
  const doorwayEnd = doorwayStart + doorwayWidth
  const doorwayCenter = doorwayStart + doorwayWidth / 2
  const roomMinZ = centerZ - depth / 2
  const roomMaxZ = centerZ + depth / 2
  const wallBeforeDoor = doorwayStart - roomMinZ
  const wallAfterDoor = roomMaxZ - doorwayEnd
  const paintings = objects.filter(
    (object): object is PaintingConfig => object.type === 'painting',
  )
  const roomSigns = objects.filter(
    (object): object is RoomSignConfig => object.type === 'roomSign',
  )
  const [floorSource, wallSource] = useTexture(['/floor.jpg', '/wall.jpg'])
  const floorTexture = useMemo(
    () => tiledTexture(floorSource, width / 5, depth / 5),
    [depth, floorSource, width],
  )
  const longWallTexture = useMemo(
    () => tiledTexture(wallSource, width / 4, height / 4),
    [height, wallSource, width],
  )
  const sideWallTexture = useMemo(
    () => tiledTexture(wallSource, depth / 4, height / 4),
    [depth, height, wallSource],
  )

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
        <meshStandardMaterial map={floorTexture} color="#d8bd94" roughness={0.76} />
      </mesh>
      {room?.skylight !== false && (
        <CeilingSkylight centerX={centerX} centerZ={centerZ} baseY={baseY} width={width} depth={depth} height={height} />
      )}
      <mesh receiveShadow position={[centerX, baseY + height / 2, roomMinZ]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[centerX, baseY + height / 2, roomMaxZ]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[centerX - width / 2, baseY + height / 2, centerZ]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial map={sideWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[centerX + width / 2, baseY + height / 2, roomMinZ + wallBeforeDoor / 2]}>
        <boxGeometry args={[wallThickness, height, wallBeforeDoor]} />
        <meshStandardMaterial map={sideWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[centerX + width / 2, baseY + height / 2, doorwayEnd + wallAfterDoor / 2]}>
        <boxGeometry args={[wallThickness, height, wallAfterDoor]} />
        <meshStandardMaterial map={sideWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh
        receiveShadow
        position={[
          centerX + width / 2,
          baseY + doorwayHeight + (height - doorwayHeight) / 2,
          doorwayCenter,
        ]}
      >
        <boxGeometry args={[wallThickness, height - doorwayHeight, doorwayWidth]} />
        <meshStandardMaterial map={sideWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      {roomSigns.map((sign) => (
        <RoomSign
          key={sign.id}
          room={sign.room}
          title={sign.title}
          position={sign.position}
          rotation={sign.rotation}
          width={sign.size[0]}
          height={sign.size[1]}
        />
      ))}

      {paintings.map((painting) =>
        painting.image && painting.framePreset ? (
          <ConfiguredMuseumPainting key={painting.id} painting={painting} />
        ) : (
          <Painting key={painting.id} config={painting} />
        ),
      )}
    </group>
  )
}
