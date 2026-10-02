import { Environment } from '@react-three/drei'
import { PlayerController } from '../player/PlayerController'
import { DecommissionedWing } from './DecommissionedWing'
import { GalleryRoom } from './GalleryRoom'
import { IntroCameraMotion } from './IntroCameraMotion'
import { MuseumLighting } from './MuseumLighting'
import { MuseumDoors } from './MuseumDoors'
import { PrivateCollectionRoom } from './PrivateCollectionRoom'
import { SecondRoom } from './SecondRoom'
import { StaffArchiveRoom } from './StaffArchiveRoom'
import { WorldColliders } from './WorldColliders'
import { ActiveCollectionRoom } from './ActiveCollectionRoom'

export function MuseumScene() {
  return (
    <>
      <color attach="background" args={['#090806']} />
      <fog attach="fog" args={['#090806', 13, 28]} />
      <ambientLight intensity={0.26} color="#b7c7d8" />
      <directionalLight
        castShadow
        position={[1, 4.7, 2]}
        intensity={0.52}
        color="#ffdca5"
        shadow-mapSize={[1024, 1024]}
      />
      <MuseumLighting />
      <GalleryRoom />
      <SecondRoom />
      <PrivateCollectionRoom />
      <DecommissionedWing />
      <StaffArchiveRoom />
      <ActiveCollectionRoom />
      <MuseumDoors />
      <WorldColliders />
      <IntroCameraMotion />
      <PlayerController />
      <Environment preset="apartment" environmentIntensity={0.12} />
    </>
  )
}
