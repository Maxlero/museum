import type { FramePreset } from '../components/MuseumPainting'

export const ROOM = {
  width: 14,
  depth: 16,
  height: 5,
  wallThickness: 0.25,
  playerRadius: 0.32,
} as const

export const ROOM_TWO = {
  centerX: 14,
  width: 14,
  depth: 16,
  height: 5,
} as const

export const DOORWAY = {
  wallX: ROOM.width / 2,
  centerZ: 4.5,
  width: 1.6,
  height: 2.4,
} as const

export type PaintingConfig = {
  type: 'painting'
  id: string | number
  title: string
  year?: string
  description?: string
  note?: string
  descriptionItalic?: boolean
  labelPosition?: [number, number, number]
  labelSize?: [number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  image?: string
  palette?: [string, string, string]
  living?: boolean
  video?: string
  link?: string
  frame?: 'classic' | 'ornate'
  frameImage?: string
  frameSize?: [number, number]
  framePreset?: FramePreset
  subtitle?: string
}

export type RoomSignConfig = {
  type: 'roomSign'
  id: string | number
  room: string
  title: string
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
}

export type MuseumObjectConfig = PaintingConfig | RoomSignConfig
