/**
 * PlayerItem is a Partial of the Document type.
 */
export type AudioPlayerItem = {
  id: string
  meta?: {
    title: string
    path: string
    publishDate?: string
    audioSource?: {
      mediaId: string
      kind: string
      mp3: string
      aac: string
      ogg: string
      durationMs: number
      userProgress?: {
        id: string
        secs: number
      }
    }
  }
}
