import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { MediaProgress } from '@/components/Audio/types/MediaProgress'

export type AudioQueueItem = {
  id: string
  sequence: number
  userProgress: MediaProgress
  document: AudioQueueItemContent | null
}
