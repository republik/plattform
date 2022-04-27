import { timeFormat } from '../../lib/timeFormat'

export const ZINDEX_AUDIOPLAYER_ICONS = 6
export const ZINDEX_AUDIOPLAYER_SCRUB = 3
export const ZINDEX_AUDIOPLAYER_PROGRESS = 2
export const ZINDEX_AUDIOPLAYER_BUFFER = 1
export const ZINDEX_AUDIOPLAYER_TOTAL = 0
export const PROGRESS_HEIGHT = 4
export const SLIDERTHUMB_SIZE = 12
export const progressbarStyle = {
  position: 'absolute',
  height: PROGRESS_HEIGHT,
  left: 0,
  right: 0,
}

export const hoursDurationFormat = timeFormat('%-H:%M:%S')
export const minutesDurationFormat = timeFormat('%-M:%S')
export const DefaultLink = ({ children }) => children
