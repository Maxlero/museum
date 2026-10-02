import { useEffect } from 'react'
import { configureWallColliders, type WallCollider } from '../player/collisionWorld'
import {
  DECOMMISSIONED_ROOM,
  PRIVATE_ROOM,
  ROOM,
  ROOM_TWO,
  STAFF_ARCHIVE_ROOM,
  ACTIVE_COLLECTION_ROOM,
  type DoorConfig,
  type RoomConfig,
} from './config'
import { useMuseumObjects } from './useMuseumObjects'

function verticalWall(x: number, minZ: number, maxZ: number, thickness: number): WallCollider {
  const half = thickness / 2
  return { minX: x - half, maxX: x + half, minZ, maxZ }
}

function horizontalWall(z: number, minX: number, maxX: number, thickness: number): WallCollider {
  const half = thickness / 2
  return { minX, maxX, minZ: z - half, maxZ: z + half }
}

export function WorldColliders() {
  const objects = useMuseumObjects()

  useEffect(() => {
    const firstDoor = objects.find(
      (object): object is DoorConfig => object.type === 'door' && object.id === 'room-one-to-room-two',
    )
    const privateDoor = objects.find(
      (object): object is DoorConfig =>
        object.type === 'door' && object.id === 'room-two-to-private-collection',
    )
    const decommissionedDoor = objects.find(
      (object): object is DoorConfig =>
        object.type === 'door' && object.id === 'room-two-to-decommissioned-wing',
    )
    const archiveDoor = objects.find(
      (object): object is DoorConfig =>
        object.type === 'door' && object.id === 'decommissioned-to-staff-archive',
    )
    const activeCollectionDoor = objects.find(
      (object): object is DoorConfig =>
        object.type === 'door' && object.id === 'room-two-to-active-collection',
    )
    const roomOne = objects.find(
      (object): object is RoomConfig => object.type === 'room' && object.id === 'room-one',
    )
    const roomTwo = objects.find(
      (object): object is RoomConfig => object.type === 'room' && object.id === 'room-two',
    )
    const privateRoom = objects.find(
      (object): object is RoomConfig =>
        object.type === 'room' && object.id === 'private-collection-room',
    )
    const decommissionedRoom = objects.find(
      (object): object is RoomConfig =>
        object.type === 'room' && object.id === 'decommissioned-wing',
    )
    const archiveRoom = objects.find(
      (object): object is RoomConfig => object.type === 'room' && object.id === 'staff-archive',
    )
    const activeCollectionRoom = objects.find(
      (object): object is RoomConfig =>
        object.type === 'room' && object.id === 'active-collection-room',
    )

    const [roomOneX, , roomOneZ] = roomOne?.position ?? [0, 0, 0]
    const [roomOneWidth, , roomOneDepth] = roomOne?.size ?? [ROOM.width, ROOM.height, ROOM.depth]
    const roomOneThickness = roomOne?.wallThickness ?? ROOM.wallThickness
    const roomOneMinX = roomOneX - roomOneWidth / 2
    const roomOneMaxX = roomOneX + roomOneWidth / 2
    const roomOneMinZ = roomOneZ - roomOneDepth / 2
    const roomOneMaxZ = roomOneZ + roomOneDepth / 2

    const [roomTwoX, , roomTwoZ] = roomTwo?.position ?? [ROOM_TWO.centerX, 0, 0]
    const [roomTwoWidth, , roomTwoDepth] = roomTwo?.size ?? [ROOM_TWO.width, ROOM_TWO.height, ROOM_TWO.depth]
    const roomTwoThickness = roomTwo?.wallThickness ?? ROOM.wallThickness
    const roomTwoMinX = roomTwoX - roomTwoWidth / 2
    const roomTwoMaxX = roomTwoX + roomTwoWidth / 2
    const roomTwoMinZ = roomTwoZ - roomTwoDepth / 2
    const roomTwoMaxZ = roomTwoZ + roomTwoDepth / 2

    const [privateX, , privateZ] = privateRoom?.position ?? [PRIVATE_ROOM.centerX, 0, PRIVATE_ROOM.centerZ]
    const [privateWidth, , privateDepth] = privateRoom?.size ?? [PRIVATE_ROOM.width, PRIVATE_ROOM.height, PRIVATE_ROOM.depth]
    const privateThickness = privateRoom?.wallThickness ?? ROOM.wallThickness
    const privateMinX = privateX - privateWidth / 2
    const privateMaxX = privateX + privateWidth / 2
    const privateMinZ = privateZ - privateDepth / 2
    const privateMaxZ = privateZ + privateDepth / 2

    const [decommissionedX, , decommissionedZ] = decommissionedRoom?.position ?? [
      DECOMMISSIONED_ROOM.centerX,
      0,
      DECOMMISSIONED_ROOM.centerZ,
    ]
    const [decommissionedWidth, , decommissionedDepth] = decommissionedRoom?.size ?? [
      DECOMMISSIONED_ROOM.width,
      DECOMMISSIONED_ROOM.height,
      DECOMMISSIONED_ROOM.depth,
    ]
    const decommissionedThickness = decommissionedRoom?.wallThickness ?? ROOM.wallThickness
    const decommissionedMinX = decommissionedX - decommissionedWidth / 2
    const decommissionedMaxX = decommissionedX + decommissionedWidth / 2
    const decommissionedMinZ = decommissionedZ - decommissionedDepth / 2
    const decommissionedMaxZ = decommissionedZ + decommissionedDepth / 2

    const [archiveX, , archiveZ] = archiveRoom?.position ?? [
      STAFF_ARCHIVE_ROOM.centerX,
      0,
      STAFF_ARCHIVE_ROOM.centerZ,
    ]
    const [archiveWidth, , archiveDepth] = archiveRoom?.size ?? [
      STAFF_ARCHIVE_ROOM.width,
      STAFF_ARCHIVE_ROOM.height,
      STAFF_ARCHIVE_ROOM.depth,
    ]
    const archiveThickness = archiveRoom?.wallThickness ?? ROOM.wallThickness
    const archiveMinX = archiveX - archiveWidth / 2
    const archiveMaxX = archiveX + archiveWidth / 2
    const archiveMinZ = archiveZ - archiveDepth / 2
    const archiveMaxZ = archiveZ + archiveDepth / 2

    const [activeX, , activeZ] = activeCollectionRoom?.position ?? [
      ACTIVE_COLLECTION_ROOM.centerX,
      0,
      ACTIVE_COLLECTION_ROOM.centerZ,
    ]
    const [activeWidth, , activeDepth] = activeCollectionRoom?.size ?? [
      ACTIVE_COLLECTION_ROOM.width,
      ACTIVE_COLLECTION_ROOM.height,
      ACTIVE_COLLECTION_ROOM.depth,
    ]
    const activeThickness = activeCollectionRoom?.wallThickness ?? ROOM.wallThickness
    const activeMinX = activeX - activeWidth / 2
    const activeMaxX = activeX + activeWidth / 2
    const activeMinZ = activeZ - activeDepth / 2
    const activeMaxZ = activeZ + activeDepth / 2

    const firstStart = firstDoor?.position[2] ?? 3.7
    const firstEnd = firstStart + (firstDoor?.width ?? 1.6)
    const privateStart = privateDoor?.position[0] ?? 9.25
    const privateEnd = privateStart + (privateDoor?.width ?? 1.5)
    const decommissionedStart = decommissionedDoor?.position[0] ?? 9.25
    const decommissionedEnd = decommissionedStart + (decommissionedDoor?.width ?? 1.5)
    const archiveStart = archiveDoor?.position[2] ?? -11.25
    const archiveEnd = archiveStart + (archiveDoor?.width ?? 1.5)
    const activeStart = activeCollectionDoor?.position[2] ?? -1.5
    const activeEnd = activeStart + (activeCollectionDoor?.width ?? 1.5)

    configureWallColliders([
      verticalWall(roomOneMinX, roomOneMinZ, roomOneMaxZ, roomOneThickness),
      horizontalWall(roomOneMinZ, roomOneMinX, roomOneMaxX, roomOneThickness),
      horizontalWall(roomOneMaxZ, roomOneMinX, roomOneMaxX, roomOneThickness),
      verticalWall(roomOneMaxX, roomOneMinZ, firstStart, roomOneThickness),
      verticalWall(roomOneMaxX, firstEnd, roomOneMaxZ, roomOneThickness),

      verticalWall(roomTwoMaxX, roomTwoMinZ, activeStart, roomTwoThickness),
      verticalWall(roomTwoMaxX, activeEnd, roomTwoMaxZ, roomTwoThickness),
      horizontalWall(roomTwoMinZ, roomTwoMinX, decommissionedStart, roomTwoThickness),
      horizontalWall(roomTwoMinZ, decommissionedEnd, roomTwoMaxX, roomTwoThickness),
      horizontalWall(roomTwoMaxZ, roomTwoMinX, privateStart, roomTwoThickness),
      horizontalWall(roomTwoMaxZ, privateEnd, roomTwoMaxX, roomTwoThickness),

      verticalWall(privateMinX, privateMinZ, privateMaxZ, privateThickness),
      verticalWall(privateMaxX, privateMinZ, privateMaxZ, privateThickness),
      horizontalWall(privateMaxZ, privateMinX, privateMaxX, privateThickness),

      verticalWall(
        decommissionedMinX,
        decommissionedMinZ,
        decommissionedMaxZ,
        decommissionedThickness,
      ),
      verticalWall(decommissionedMaxX, decommissionedMinZ, archiveStart, decommissionedThickness),
      verticalWall(decommissionedMaxX, archiveEnd, decommissionedMaxZ, decommissionedThickness),
      horizontalWall(
        decommissionedMinZ,
        decommissionedMinX,
        decommissionedMaxX,
        decommissionedThickness,
      ),

      horizontalWall(archiveMinZ, archiveMinX, archiveMaxX, archiveThickness),
      horizontalWall(archiveMaxZ, archiveMinX, archiveMaxX, archiveThickness),
      verticalWall(archiveMaxX, archiveMinZ, archiveMaxZ, archiveThickness),

      verticalWall(activeMinX, activeMinZ, activeStart, activeThickness),
      verticalWall(activeMinX, activeEnd, activeMaxZ, activeThickness),
      verticalWall(activeMaxX, activeMinZ, activeMaxZ, activeThickness),
      horizontalWall(activeMinZ, activeMinX, activeMaxX, activeThickness),
      horizontalWall(activeMaxZ, activeMinX, activeMaxX, activeThickness),
    ])
  }, [objects])

  return null
}
