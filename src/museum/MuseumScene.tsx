import { Environment } from '@react-three/drei'
import { PlayerController } from '../player/PlayerController'
import { GalleryRoom } from './GalleryRoom'
import { IntroCameraMotion } from './IntroCameraMotion'
import { MuseumLighting } from './MuseumLighting'
import { SecondRoom } from './SecondRoom'

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
      <IntroCameraMotion />
      <PlayerController />
      <Environment preset="apartment" environmentIntensity={0.12} />
    </>
  )
}
