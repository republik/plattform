import { AudioQueueItem } from '../types/AudioPlayerItem'

function hasQueueChanged(
  previous: AudioQueueItem[] | undefined,
  next: AudioQueueItem[],
): boolean {
  if (!previous) {
    return true
  }

  if (previous.length !== next.length) {
    return true
  }

  for (let i = 0; i < previous.length; i++) {
    if (previous[i].id !== next[i].id) {
      return true
    }
  }

  return false
}

export default hasQueueChanged
