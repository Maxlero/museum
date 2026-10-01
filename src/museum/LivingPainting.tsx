import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, SRGBColorSpace, Vector3, VideoTexture } from 'three'
import { createPaintingTexture } from './paintingTexture'

type LivingPaintingProps = {
  size: [number, number]
  palette: [string, string, string]
}

type GeneratedVideo = {
  video: HTMLVideoElement
  texture: VideoTexture
  start: () => void
  stop: () => void
  dispose: () => void
}

function createGeneratedVideo(palette: [string, string, string]): GeneratedVideo {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 500
  const context = canvas.getContext('2d')!
  let frame = 0
  let animationFrame = 0
  let running = false

  const draw = () => {
    frame += 0.012
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, palette[0])
    gradient.addColorStop(0.55, palette[1])
    gradient.addColorStop(1, palette[2])
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.globalCompositeOperation = 'screen'
    for (let index = 0; index < 18; index += 1) {
      const phase = frame + index * 0.61
      const x = canvas.width * (0.5 + Math.sin(phase * 0.8) * 0.5)
      const y = canvas.height * (0.52 + Math.cos(phase * 1.25) * 0.28)
      const radius = 35 + index * 6 + Math.sin(phase * 2) * 12
      context.fillStyle = index % 2 ? 'rgba(255,217,160,.08)' : 'rgba(93,174,190,.09)'
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
    context.globalCompositeOperation = 'source-over'

    const glowX = canvas.width * (0.5 + Math.sin(frame * 0.45) * 0.22)
    const glowY = canvas.height * (0.45 + Math.cos(frame * 0.72) * 0.13)
    const glow = context.createRadialGradient(glowX, glowY, 3, glowX, glowY, 145)
    glow.addColorStop(0, 'rgba(255,246,205,.82)')
    glow.addColorStop(0.18, 'rgba(255,196,119,.5)')
    glow.addColorStop(1, 'rgba(255,175,110,0)')
    context.fillStyle = glow
    context.fillRect(0, 0, canvas.width, canvas.height)
    if (running) animationFrame = requestAnimationFrame(draw)
  }
  draw()

  const stream = canvas.captureStream(30)
  const video = document.createElement('video')
  video.srcObject = stream
  video.muted = true
  video.playsInline = true
  const texture = new VideoTexture(video)
  texture.colorSpace = SRGBColorSpace

  return {
    video,
    texture,
    start: () => {
      if (!running) {
        running = true
        animationFrame = requestAnimationFrame(draw)
      }
      void video.play().catch(() => undefined)
    },
    stop: () => {
      running = false
      cancelAnimationFrame(animationFrame)
      video.pause()
    },
    dispose: () => {
      running = false
      cancelAnimationFrame(animationFrame)
      stream.getTracks().forEach((track) => track.stop())
      video.pause()
      video.srcObject = null
      texture.dispose()
    },
  }
}

export function LivingPainting({ size, palette }: LivingPaintingProps) {
  const group = useRef<Group>(null)
  const { camera } = useThree()
  const [active, setActive] = useState(false)
  const generated = useMemo(() => createGeneratedVideo(palette), [palette])
  const poster = useMemo(() => createPaintingTexture(palette), [palette])
  const worldPosition = useMemo(() => new Vector3(), [])
  const viewDirection = useMemo(() => new Vector3(), [])
  const toPainting = useMemo(() => new Vector3(), [])

  useEffect(() => () => {
    generated.dispose()
    poster.dispose()
  }, [generated, poster])

  useEffect(() => {
    if (active) {
      generated.start()
    } else {
      generated.stop()
    }
  }, [active, generated])

  useFrame(() => {
    if (!group.current) return
    group.current.getWorldPosition(worldPosition)
    camera.getWorldDirection(viewDirection)
    toPainting.copy(worldPosition).sub(camera.position)
    const distance = toPainting.length()
    const inView = viewDirection.dot(toPainting.normalize()) > 0.78
    const shouldPlay = distance < 4.5 && inView && Boolean(document.pointerLockElement)
    setActive((current) => (current === shouldPlay ? current : shouldPlay))
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={active ? generated.texture : poster} toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, 0, 0.55]}
        color="#f7b771"
        intensity={active ? 1.25 : 0}
        distance={3.5}
      />
    </group>
  )
}
