import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import { AudioQueueItem } from '../types/AudioQueueItem'
import { audioCoverUrl } from './audioCoverImages'

/**
 * Translates a queue item into the shape the native app's headless player
 * expects in the `audio:setupTrack` payload — see
 * docs/content/software/applications/www/app-integration/audio-player.mdx
 *
 */
export function toNativeAppTrack(item: AudioQueueItem) {
  const { document } = item
  const cover = (size: number) => audioCoverUrl(document?.image, size)
  // `image` and `coverForNativeApp` were distinct fields upstream but resolve
  // to the same square crop here, so build it once.
  const coverLarge = cover(1024)

  return {
    // The queue slot's own id, not the document's: the app sends this back
    // with `audio:queueAdvance`, where it's matched against the queue.
    id: item.id,
    sequence: item.sequence,
    document: {
      id: document ? collectionsDocumentId(document) : null,
      meta: {
        title: document?.title ?? null,
        path: document?.slug ?? null,
        publishDate: document?.publishDate ?? null,
        image: coverLarge,
        audioCoverCrop: null,
        coverForNativeApp: coverLarge,
        coverMd: cover(256),
        coverSm: cover(128),
        audioSource: {
          mediaId: item.mediaId,
          kind: document?.syntheticVoiceEnabled
            ? 'syntheticReadAloud'
            : 'readAloud',
          mp3: document?.audioSourceMp3 ?? null,
          // Alternative encodings only ever existed in the legacy backend.
          aac: null,
          ogg: null,
          durationMs: document?.audioDurationMs ?? null,
          userProgress: item.userProgress ?? null,
        },
        format: null,
      },
    },
  }
}
