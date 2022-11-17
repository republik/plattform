import { MediaProgress } from './MediaProgress'

type AudioSourceKind = 'podcast' | 'readAloud' | 'syntheticReadAloud'

export type AudioSource = {
  mediaId: string
  kind?: AudioSourceKind
  mp3?: string
  aac?: string
  ogg?: string
  durationMs: number
  userProgress?: MediaProgress
}
