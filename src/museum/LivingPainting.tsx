import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, SRGBColorSpace, Vector3, VideoTexture } from 'three'
import { createPaintingTexture } from './paintingTexture'

type LivingPaintingProps = {
  size: [number, number]
  palette: [string, string, string]
  video?: string
}

type GeneratedVideo = {
  video: HTMLVideoElement
  texture: VideoTexture
  start: () => void
  stop: () => void
  dispose: () => void
}

function createLocalVideo(source: string): GeneratedVideo {
  const video = document.createElement('video')
  video.src = source
  video.preload = 'metadata'
  video.muted = false
  video.volume = 0.85
  video.loop = true
  video.playsInline = true
  const texture = new VideoTexture(video)
  texture.colorSpace = SRGBColorSpace

  return {
    video,
    texture,
    start: () => {
      void video.play().catch(() => undefined)
    },
    stop: () => {
      video.pause()
      if (video.readyState > 0) video.currentTime = 0
    },
    dispose: () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
      texture.dispose()
    },
  }
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

function GeneratedLivingPainting({ size, palette }: Omit<LivingPaintingProps, 'video'>) {
  const group = useRef<Group>(null)
  const { camera } = useThree()
  const [active, setActive] = useState(false)
  const media = useMemo(() => createGeneratedVideo(palette), [palette])
  const poster = useMemo(() => createPaintingTexture(palette), [palette])
  const worldPosition = useMemo(() => new Vector3(), [])
  const viewDirection = useMemo(() => new Vector3(), [])
  const toPainting = useMemo(() => new Vector3(), [])

  useEffect(() => () => {
    media.dispose()
    poster.dispose()
  }, [media, poster])

  useEffect(() => {
    if (active) {
      media.start()
    } else {
      media.stop()
    }
  }, [active, media])

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
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={active ? media.texture : poster} toneMapped={false} />
      </mesh>
    </group>
  )
}

function LocalVideoPainting({ size, videoSource }: { size: [number, number]; videoSource: string }) {
  const group = useRef<Group>(null)
  const { camera } = useThree()
  const [active, setActive] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const activeRef = useRef(false)
  const shouldLoadRef = useRef(false)
  const [media, setMedia] = useState<GeneratedVideo | null>(null)
  const [videoAspect, setVideoAspect] = useState<number | null>(null)
  const worldPosition = useMemo(() => new Vector3(), [])
  const viewDirection = useMemo(() => new Vector3(), [])
  const toPainting = useMemo(() => new Vector3(), [])

  useEffect(() => {
    if (!shouldLoad) return
    const resource = createLocalVideo(videoSource)
    const updateAspect = () => {
      if (!resource.video.videoWidth || !resource.video.videoHeight) return
      setVideoAspect(resource.video.videoWidth / resource.video.videoHeight)
      resource.video.currentTime = 0.01
    }
    resource.video.addEventListener('loadedmetadata', updateAspect)
    resource.video.addEventListener('loadeddata', updateAspect)
    resource.video.load()
    setMedia(resource)

    return () => {
      resource.video.removeEventListener('loadedmetadata', updateAspect)
      resource.video.removeEventListener('loadeddata', updateAspect)
      resource.dispose()
      setMedia(null)
      setVideoAspect(null)
    }
  }, [shouldLoad, videoSource])

  useEffect(() => {
    if (!media) return
    if (active) media.start()
    else media.stop()
  }, [active, media])

  const displaySize = useMemo<[number, number]>(() => {
    if (!videoAspect) return size
    const frameAspect = size[0] / size[1]
    return videoAspect > frameAspect
      ? [size[0], size[0] / videoAspect]
      : [size[1] * videoAspect, size[1]]
  }, [size, videoAspect])

  useFrame(() => {
    if (!group.current) return
    group.current.getWorldPosition(worldPosition)
    camera.getWorldDirection(viewDirection)
    toPainting.copy(worldPosition).sub(camera.position)
    const distance = toPainting.length()
    const viewAlignment = viewDirection.dot(toPainting.normalize())
    const keepLoaded = media
      ? distance < 9 && viewAlignment > -0.15
      : distance < 7 && viewAlignment > 0.35
    const shouldPlay =
      distance < 4.5 && viewAlignment > 0.78 && Boolean(document.pointerLockElement)
    if (shouldLoadRef.current !== keepLoaded) {
      shouldLoadRef.current = keepLoaded
      setShouldLoad(keepLoaded)
    }
    if (activeRef.current !== shouldPlay) {
      activeRef.current = shouldPlay
      setActive(shouldPlay)
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#161412" roughness={0.86} />
      </mesh>
      {media && (
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={displaySize} />
          <meshBasicMaterial map={media.texture} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

export function LivingPainting({ size, palette, video }: LivingPaintingProps) {
  return video ? (
    <LocalVideoPainting size={size} videoSource={video} />
  ) : (
    <GeneratedLivingPainting size={size} palette={palette} />
  )
}
