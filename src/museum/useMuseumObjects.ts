import { useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import { FileLoader } from 'three'
import type { MuseumObjectConfig } from './config'

export function useMuseumObjects() {
  const source = useLoader(FileLoader, '/objects.json') as unknown as string
  return useMemo(() => JSON.parse(source) as MuseumObjectConfig[], [source])
}
