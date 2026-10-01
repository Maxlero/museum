import { Door } from '../components/Door'
import type { DoorAccessSignConfig, DoorConfig, KeypadConfig } from './config'
import { useMuseumObjects } from './useMuseumObjects'

export function MuseumDoors() {
  const objects = useMuseumObjects()
  const doors = objects.filter((object): object is DoorConfig => object.type === 'door')

  return (
    <>
      {doors.map((door) => {
        const doorId = String(door.id)
        const accessSign = objects.find(
          (object): object is DoorAccessSignConfig =>
            object.type === 'doorAccessSign' && object.doorId === doorId,
        )
        const keypad = objects.find(
          (object): object is KeypadConfig => object.type === 'keypad' && object.doorId === doorId,
        )

        return (
          <Door
            key={door.id}
            id={doorId}
            position={door.position}
            rotation={door.rotation}
            width={door.width}
            height={door.height}
            openAngle={door.openAngle}
            openSpeed={door.openSpeed}
            interactionDistance={door.interactionDistance}
            accessCode={door.accessCode}
            collectionTitle={door.collectionTitle}
            restrictedMessage={door.restrictedMessage}
            grantedMessage={door.grantedMessage}
            panelSide={door.panelSide}
            accessSign={accessSign}
            keypad={keypad}
            autoCloseSeconds={door.autoCloseSeconds}
          />
        )
      })}
    </>
  )
}
