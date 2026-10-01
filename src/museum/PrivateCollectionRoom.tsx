import { useEffect, useRef } from 'react'
import { Object3D, SpotLight } from 'three'
import { PRIVATE_ROOM, ROOM, type DoorConfig, type RoomConfig } from './config'
import { useMuseumObjects } from './useMuseumObjects'

function WallLamp({
  position,
  rotation = 0,
  intensity = 11,
}: {
  position: [number, number, number]
  rotation?: number
  intensity?: number
}) {
  const light = useRef<SpotLight>(null)
  const target = useRef<Object3D>(null)

  useEffect(() => {
    if (light.current && target.current) light.current.target = target.current
  }, [])

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0, 0.035]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.105, 0.105, 0.07, 16]} />
        <meshStandardMaterial color="#8b6734" roughness={0.35} metalness={0.72} />
      </mesh>
      <mesh castShadow position={[0, -0.02, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.25, 10]} />
        <meshStandardMaterial color="#a67d3e" roughness={0.32} metalness={0.68} />
      </mesh>
      <mesh castShadow position={[0, -0.19, 0.27]}>
        <cylinderGeometry args={[0.08, 0.2, 0.24, 18, 1, true]} />
        <meshStandardMaterial color="#7d5b2f" roughness={0.42} metalness={0.62} side={2} />
      </mesh>
      <mesh position={[0, -0.3, 0.27]}>
        <sphereGeometry args={[0.055, 14, 10]} />
        <meshStandardMaterial color="#ffe0a1" emissive="#ff9d43" emissiveIntensity={3} />
      </mesh>
      <spotLight
        ref={light}
        position={[0, -0.27, 0.29]}
        color="#ff9d4f"
        intensity={intensity}
        distance={4.2}
        angle={0.48}
        penumbra={0.72}
        decay={2}
      />
      <object3D ref={target} position={[0, -1.25, 0.38]} />
    </group>
  )
}

export function PrivateCollectionRoom() {
  const objects = useMuseumObjects()
  const room = objects.find(
    (object): object is RoomConfig =>
      object.type === 'room' && object.id === 'private-collection-room',
  )
  const entranceDoor = objects.find(
    (object): object is DoorConfig =>
      object.type === 'door' && object.id === 'room-two-to-private-collection',
  )
  const [centerX, baseY, centerZ] = room?.position ?? [PRIVATE_ROOM.centerX, 0, PRIVATE_ROOM.centerZ]
  const [width, height, depth] = room?.size ?? [PRIVATE_ROOM.width, PRIVATE_ROOM.height, PRIVATE_ROOM.depth]
  const wallThickness = room?.wallThickness ?? ROOM.wallThickness
  const minX = centerX - width / 2
  const maxX = centerX + width / 2
  const farZ = centerZ + depth / 2
  const nearZ = centerZ - depth / 2
  const doorStart = entranceDoor?.position[0] ?? centerX - 0.75
  const doorWidth = entranceDoor?.width ?? 1.5
  const doorHeight = entranceDoor?.height ?? 2.25
  const doorEnd = doorStart + doorWidth
  const entranceLeftWidth = doorStart - minX
  const entranceRightWidth = maxX - doorEnd
  const entranceFaceZ = nearZ + wallThickness / 2 + 0.014
  const sideLampZ = [centerZ - depth * 0.3, centerZ, centerZ + depth * 0.3]
  const backLampX = [centerX - width * 0.27, centerX + width * 0.27]

  return (
    <group>
      <mesh receiveShadow position={[centerX, baseY - 0.1, centerZ]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color="#21070e" roughness={0.98} />
      </mesh>
      <mesh receiveShadow position={[centerX, baseY + height, centerZ]}>
        <boxGeometry args={[width, 0.18, depth]} />
        <meshStandardMaterial color="#16080c" roughness={0.92} />
      </mesh>

      <mesh receiveShadow position={[minX, baseY + height / 2, centerZ]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color="#541323" roughness={0.96} />
      </mesh>
      <mesh receiveShadow position={[maxX, baseY + height / 2, centerZ]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color="#541323" roughness={0.96} />
      </mesh>
      <mesh receiveShadow position={[centerX, baseY + height / 2, farZ]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color="#4a0c1c" roughness={0.96} />
      </mesh>

      {/* Бордовая внутренняя облицовка общей стены вокруг входной двери. */}
      <mesh receiveShadow position={[minX + entranceLeftWidth / 2, baseY + height / 2, entranceFaceZ]}>
        <boxGeometry args={[entranceLeftWidth, height, 0.02]} />
        <meshStandardMaterial color="#541323" roughness={0.96} />
      </mesh>
      <mesh receiveShadow position={[doorEnd + entranceRightWidth / 2, baseY + height / 2, entranceFaceZ]}>
        <boxGeometry args={[entranceRightWidth, height, 0.02]} />
        <meshStandardMaterial color="#541323" roughness={0.96} />
      </mesh>
      <mesh
        receiveShadow
        position={[doorStart + doorWidth / 2, baseY + doorHeight + (height - doorHeight) / 2, entranceFaceZ]}
      >
        <boxGeometry args={[doorWidth, height - doorHeight, 0.02]} />
        <meshStandardMaterial color="#541323" roughness={0.96} />
      </mesh>

      {/* Тяжёлые бархатные панели на дальней стене. */}
      {[-1.82, -0.91, 0, 0.91, 1.82].map((offset, index) => (
        <mesh key={offset} receiveShadow position={[centerX + offset, baseY + height * 0.43, farZ - 0.15]}>
          <boxGeometry args={[0.92, 3.05, 0.08]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#360716' : '#430919'}
            roughness={1}
          />
        </mesh>
      ))}
      {sideLampZ.map((z) => (
        <WallLamp
          key={`left-${z}`}
          position={[minX + 0.17, baseY + height - 0.5, z]}
          rotation={Math.PI / 2}
        />
      ))}
      {sideLampZ.map((z) => (
        <WallLamp
          key={`right-${z}`}
          position={[maxX - 0.17, baseY + height - 0.5, z]}
          rotation={-Math.PI / 2}
        />
      ))}
      {backLampX.map((x) => (
        <WallLamp
          key={`back-${x}`}
          position={[x, baseY + height - 0.5, farZ - 0.18]}
          rotation={Math.PI}
          intensity={9}
        />
      ))}
      <pointLight position={[centerX, baseY + height - 0.55, centerZ]} color="#8d2036" intensity={4} distance={7} decay={2} />
    </group>
  )
}
