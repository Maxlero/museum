import { Canvas } from '@react-three/fiber'
import { MuseumScene } from './museum/MuseumScene'
import { Crosshair } from './ui/Crosshair'
import { StartOverlay } from './ui/StartOverlay'
import { AccessChallengeProvider } from './interaction/AccessChallengeContext'
import { SolitaireTerminalOverlay } from './ui/SolitaireTerminalOverlay'

export default function App() {
  return (
    <AccessChallengeProvider>
      <main className="app-shell">
        <Canvas
          camera={{ position: [0, 1.65, 5.8], fov: 68, near: 0.05, far: 80 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          shadows
        >
          <MuseumScene />
        </Canvas>
        <Crosshair />
        <StartOverlay />
        <SolitaireTerminalOverlay />
      </main>
    </AccessChallengeProvider>
  )
}
