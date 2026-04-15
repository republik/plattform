import VideoCover from '../VideoCover'
import ReasonsCover from './ReasonsCover'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'

const VIDEOS = {
  main: {
    hls: 'https://player.vimeo.com/external/394299161.m3u8?s=04b073df4a9a2e46dbf3bb030a81d7b233b70e10',
    mp4: 'https://player.vimeo.com/external/394299161.hd.mp4?s=52bbb16e068387bd4e44683de01cbfebdcbc95e1&profile_id=175',
    subtitles: '/static/subtitles/cf2.vtt',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/manifest.png`,
  },
}

const ReasonsVideo = () => (
  <VideoCover
    src={VIDEOS.main}
    customCover={<ReasonsCover />}
    playTop='65%'
    endScroll={0.97}
  />
)

export default ReasonsVideo
