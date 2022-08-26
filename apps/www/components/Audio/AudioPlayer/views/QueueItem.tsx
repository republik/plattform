import { AudioPlayerItem } from '../../types/AudioPlayerItem'

const styles = {}

type QueueItemProps = {
  item: AudioPlayerItem
}

const QueueItem = ({ item }: QueueItemProps) => {
  return <div>{item.meta.title}</div>
}

export default QueueItem
