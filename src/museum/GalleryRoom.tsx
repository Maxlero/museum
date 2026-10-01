import { useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { FileLoader, RepeatWrapping, SRGBColorSpace, Texture } from 'three'
import { useLoader } from '@react-three/fiber'
import { MuseumPainting } from '../components/MuseumPainting'
import { Door } from '../components/Door'
import { RoomSign } from '../components/RoomSign'
import { CeilingSkylight } from './CeilingSkylight'
import {
  DOORWAY,
  ROOM,
  type MuseumObjectConfig,
  type PaintingConfig,
  type RoomSignConfig,
} from './config'
import { Painting } from './Painting'
import { PaintingLabel } from './PaintingLabel'

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
  const { width, depth, height, wallThickness } = ROOM
  const doorwayStart = DOORWAY.centerZ - DOORWAY.width / 2
  const doorwayEnd = DOORWAY.centerZ + DOORWAY.width / 2
  const wallBeforeDoor = doorwayStart + depth / 2
  const wallAfterDoor = depth / 2 - doorwayEnd
  const objectsSource = useLoader(FileLoader, '/objects.json') as unknown as string
  const objects = useMemo(
    () => JSON.parse(objectsSource) as MuseumObjectConfig[],
    [objectsSource],
  )
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
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial map={floorTexture} color="#d8bd94" roughness={0.76} />
      </mesh>
      <CeilingSkylight />
      <mesh receiveShadow position={[0, height / 2, -depth / 2]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[0, height / 2, depth / 2]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial map={longWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[-width / 2, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial map={sideWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[width / 2, height / 2, -depth / 2 + wallBeforeDoor / 2]}>
        <boxGeometry args={[wallThickness, height, wallBeforeDoor]} />
        <meshStandardMaterial map={sideWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[width / 2, height / 2, doorwayEnd + wallAfterDoor / 2]}>
        <boxGeometry args={[wallThickness, height, wallAfterDoor]} />
        <meshStandardMaterial map={sideWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>
      <mesh
        receiveShadow
        position={[
          width / 2,
          DOORWAY.height + (height - DOORWAY.height) / 2,
          DOORWAY.centerZ,
        ]}
      >
        <boxGeometry args={[wallThickness, height - DOORWAY.height, DOORWAY.width]} />
        <meshStandardMaterial map={sideWallTexture} color="#d1cbc1" roughness={0.94} />
      </mesh>

      <Door
        id="room-one-to-room-two"
        position={[width / 2 - 0.16, 0, doorwayStart]}
        width={DOORWAY.width}
        height={DOORWAY.height}
      />
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
