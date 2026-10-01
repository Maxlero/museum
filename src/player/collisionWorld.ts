export type WallCollider = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

type DoorCollider = {
  startX: number
  startZ: number
  endX: number
  endZ: number
  thickness: number
}

let wallColliders: WallCollider[] = []

export function configureWallColliders(colliders: WallCollider[]) {
  wallColliders = colliders
}

const doorColliders = new Map<string, DoorCollider>()

export function updateDoorCollider(id: string, collider: DoorCollider) {
  doorColliders.set(id, collider)
}

export function removeDoorCollider(id: string) {
  doorColliders.delete(id)
}

function squaredDistanceToSegment(
  x: number,
  z: number,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
) {
  const segmentX = endX - startX
  const segmentZ = endZ - startZ
  const lengthSquared = segmentX * segmentX + segmentZ * segmentZ
  if (lengthSquared === 0) return (x - startX) ** 2 + (z - startZ) ** 2

  const projection = Math.max(
    0,
    Math.min(1, ((x - startX) * segmentX + (z - startZ) * segmentZ) / lengthSquared),
  )
  const closestX = startX + segmentX * projection
  const closestZ = startZ + segmentZ * projection
  return (x - closestX) ** 2 + (z - closestZ) ** 2
}

export function isWalkablePosition(x: number, z: number, playerRadius: number) {
  for (const wall of wallColliders) {
    if (
      x > wall.minX - playerRadius &&
      x < wall.maxX + playerRadius &&
      z > wall.minZ - playerRadius &&
      z < wall.maxZ + playerRadius
    ) {
      return false
    }
  }

  for (const door of doorColliders.values()) {
    const collisionRadius = playerRadius + door.thickness / 2
    if (
      squaredDistanceToSegment(
        x,
        z,
        door.startX,
        door.startZ,
        door.endX,
        door.endZ,
      ) < collisionRadius * collisionRadius
    ) {
      return false
    }
  }

  return true
}
