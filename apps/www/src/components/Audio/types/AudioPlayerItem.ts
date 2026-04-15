import { AudioQueueItemFragment } from '#graphql/republik-api/__generated__/gql/graphql'

export type AudioQueueItem = AudioQueueItemFragment
export type AudioPlayerItem = AudioQueueItem['document']
