import type { FramePreset } from '../components/MuseumPainting'

export const ROOM = {
  width: 14,
  depth: 16,
  height: 5,
  wallThickness: 0.25,
  playerRadius: 0.32,
} as const

export const ROOM_TWO = {
  centerX: 12,
  width: 10,
  depth: 14,
  height: 4.35,
} as const

export const DOORWAY = {
  wallX: ROOM.width / 2,
  centerZ: 4.5,
  width: 1.6,
  height: 2.4,
} as const

export const PRIVATE_ROOM = {
  centerX: 10,
  centerZ: 11,
  width: 6,
  depth: 8,
  height: 3.8,
} as const

export const DECOMMISSIONED_ROOM = {
  centerX: 12,
  centerZ: -14,
  width: 8,
  depth: 14,
  height: 4.35,
} as const

export const STAFF_ARCHIVE_ROOM = {
  centerX: 37,
  centerZ: -10.75,
  width: 42,
  depth: 7,
  height: 4.5,
} as const

export const ACTIVE_COLLECTION_ROOM = {
  entry: {
    position: [20.55, 0, -0.75] as [number, number, number],
    size: [7, 4.2, 3.1] as [number, number, number],
  },
  reveal: {
    position: [26, 0, 7.4] as [number, number, number],
    size: [9, 4.8, 13.2] as [number, number, number],
  },
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
  labelLines?: Array<{
    text: string
    italic?: boolean
    bold?: boolean
  }>
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
  placeholderText?: string
}

export type RoomConfig = {
  type: 'room'
  id: string
  position: [number, number, number]
  size: [number, number, number]
  wallThickness?: number
  style?: 'gallery' | 'privateCollection' | 'decommissioned' | 'archive' | 'activeCollection'
  skylight?: boolean
  segments?: Array<{
    id: string
    position: [number, number, number]
    size: [number, number, number]
  }>
}

export type GiftPedestalConfig = {
  type: 'giftPedestal'
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number, number]
  title: string
  message: string
}

export type RoomSignConfig = {
  type: 'roomSign'
  id: string | number
  room: string
  title: string
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  lines?: Array<{
    text: string
    italic?: boolean
  }>
}

export type DoorConfig = {
  type: 'door'
  id: string | number
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
  height: number
  openAngle?: number
  openSpeed?: number
  interactionDistance?: number
  accessCode?: string
  challengeMode?: 'pin' | 'solitaire'
  collectionTitle?: string
  restrictedMessage?: string
  grantedMessage?: string
  panelSide?: -1 | 1
  autoCloseSeconds?: number
}

export type AccessTerminalConfig = {
  type: 'accessTerminal'
  id: string
  doorId: string
  mode: 'pin' | 'solitaire'
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number, number]
}

export type DoorAccessSignConfig = {
  type: 'doorAccessSign'
  id: string
  doorId: string
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number, number]
}

export type KeypadConfig = {
  type: 'keypad'
  id: string
  doorId: string
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number, number]
}

export type MuseumObjectConfig =
  | RoomConfig
  | PaintingConfig
  | RoomSignConfig
  | DoorConfig
  | DoorAccessSignConfig
  | KeypadConfig
  | AccessTerminalConfig
  | GiftPedestalConfig
