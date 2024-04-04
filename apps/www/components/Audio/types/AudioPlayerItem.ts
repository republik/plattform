import { AudioQueueItemFragment } from '#graphql/republik-api/__generated__/gql/graphql'
import Nullable from '../../../lib/types/Nullable'

/**
 * PlayerItem is a partial of the Document type.
 */
// export type AudioPlayerItem = {
//   id: string
//   meta?: {
//     title: string
//     path: string
//     publishDate?: string
//     image?: string
//     audioCoverCrop?: {
//       x: number
//       y: number
//       width: number
//       height: number
//     }
//     coverForNativeApp?: string
//     coverMd?: string
//     coverSm?: string
//     audioSource?: {
//       mediaId: string
//       kind: 'syntheticReadAloud' | 'readAloud'
//       mp3: Nullable<string>
//       aac: Nullable<string>
//       ogg: Nullable<string>
//       durationMs: number
//       userProgress?: {
//         id: string
//         secs: number
//       }
//     }
//     format?: {
//       meta: {
//         title: string
//         color: string
//         shareLogo: string
//         shareBackgroundImage: string
//         shareBackgroundImageInverted: string
//       }
//     }
//   }
// }

export type AudioQueueItem = AudioQueueItemFragment
export type AudioPlayerItem = AudioQueueItem['document']
