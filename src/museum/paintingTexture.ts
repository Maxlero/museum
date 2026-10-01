import { CanvasTexture, SRGBColorSpace } from 'three'

export function createPaintingTexture(palette: [string, string, string]) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 512
  const context = canvas.getContext('2d')!

  const sky = context.createLinearGradient(0, 0, 0, canvas.height)
  sky.addColorStop(0, palette[0])
  sky.addColorStop(0.58, palette[1])
  sky.addColorStop(1, palette[2])
  context.fillStyle = sky
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.globalAlpha = 0.52
  for (let index = 0; index < 22; index += 1) {
    const x = ((index * 193) % canvas.width) - 100
    const y = 120 + ((index * 71) % 340)
    const radius = 45 + ((index * 37) % 130)
    context.fillStyle = index % 3 === 0 ? palette[2] : palette[index % 2]
    context.beginPath()
    context.ellipse(x, y, radius * 1.7, radius, -0.3, 0, Math.PI * 2)
    context.fill()
  }

  context.globalAlpha = 0.18
  context.strokeStyle = '#fff4dd'
  context.lineWidth = 5
  for (let index = 0; index < 14; index += 1) {
    context.beginPath()
    context.moveTo(-20, index * 43 + 20)
    context.bezierCurveTo(180, index * 20, 500, index * 58, 800, index * 30)
    context.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
