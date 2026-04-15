import { Component } from 'react'
import { css } from 'glamor'
import { VideoPlayer, mediaQueries } from '@project-r/styleguide'

import { scrollIt } from '../lib/utils/scroll'
import { HEADER_HEIGHT, ZINDEX_HEADER } from './constants'
import { IconPlay } from '@republik/icons'

const blinkBg = css.keyframes({
  'from, to': {
    backgroundColor: 'transparent',
  },
  '50%': {
    backgroundColor: 'white',
  },
})

const MAX_HEIGHT = 0.7
const MAX_HEIGHT_VH = MAX_HEIGHT * 100
const ASPECT_RATIO = 2 / 1

const styles = {
  wrapper: css({
    position: 'relative',
    height: `${(1 / ASPECT_RATIO) * 100}vw`,
    backgroundColor: '#000',
    transition: 'height 200ms',
    '& > div': {
      height: '100%',
    },
  }),
  cover: css({
    position: 'absolute',
    cursor: 'pointer',
    zIndex: 1,
    left: 0,
    top: 0,
    right: 0,
  }),
  maxWidth: css({
    position: 'relative',
    margin: '0 auto',
    maxWidth: `${MAX_HEIGHT_VH * ASPECT_RATIO}vh`,
    overflow: 'hidden',
    textAlign: 'center',
  }),
  poster: css({
    width: 'auto',
    height: `${(1 / ASPECT_RATIO) * 100}vw`,
  }),
  cursor: css({
    position: 'absolute',
    top: '39.5%',
    left: '65.6%',
    height: '11%',
    width: '0.3%',
    minWidth: 1,
    maxWidth: 2,
    animation: `1s ${blinkBg} step-end infinite`,
  }),
  play: css({
    position: 'absolute',
    top: '60%',
    left: '5%',
    right: '5%',
    textAlign: 'center',
  }),
}

class VideoCover extends Component {
  constructor(props) {
    super(props)

    this.state = {
      playing: undefined,
      cover: !props.backgroundAutoPlay,
    }
    this.measure = () => {
      this.setState(() => {
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        let videoHeight = windowWidth * (1 / ASPECT_RATIO)
        return {
          mobile: windowWidth < mediaQueries.mBreakPoint,
          windowHeight,
          videoHeight,
        }
      })
    }
    this.ref = (ref) => {
      this.player = ref
    }
  }
  componentDidMount() {
    window.addEventListener('resize', this.measure)
    this.measure()
    if (this.props.forceAutoPlay && this.player) {
      this.setState(() => {
        this.player.play()
        return {
          cover: false,
        }
      })
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.measure)
    if (this.checkPlaying === undefined) {
      clearTimeout(this.checkPlaying)
    }
  }
  render() {
    const {
      src,
      cursor,
      limited,
      backgroundAutoPlay,
      muted,
      loop,
      playTop,
      customCover,
    } = this.props
    const { playing, ended, videoHeight, windowHeight, mobile, cover } =
      this.state

    const limitedHeight = !!limited || !playing || !videoHeight
    const heightStyle = {
      height: playing && !ended && !limitedHeight ? windowHeight : videoHeight,
      maxHeight: limitedHeight ? `${MAX_HEIGHT_VH}vh` : undefined,
    }
    return (
      <div
        {...styles.wrapper}
        style={{
          ...heightStyle,
          zIndex: !limitedHeight ? ZINDEX_HEADER + 1 : undefined,
        }}
      >
        <div
          {...styles.cover}
          style={{ opacity: cover ? 1 : 0 }}
          onClick={() => {
            this.setState(() => {
              this.player.toggle()
              return {
                clicked: true,
                cover: false,
              }
            })
          }}
        >
          <div {...styles.maxWidth}>
            {customCover ? (
              <div {...styles.poster} style={heightStyle}>
                {customCover}
              </div>
            ) : (
              <img src={src.thumbnail} {...styles.poster} style={heightStyle} />
            )}
            {!!cursor && <div {...styles.cursor} />}
            {!customCover && (
              <div {...styles.play} style={{ top: playTop }}>
                <IconPlay />
              </div>
            )}
          </div>
        </div>
        <VideoPlayer
          ref={this.ref}
          src={
            customCover
              ? {
                  ...src,
                  thumbnail:
                    'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
                }
              : src
          }
          showPlay={!cover && playing !== undefined}
          autoPlay={backgroundAutoPlay}
          attributes={
            backgroundAutoPlay
              ? {
                  playsInline: true,
                  'webkit-playsinline': '',
                }
              : {}
          }
          forceMuted={muted}
          loop={loop}
          onPlay={() => {
            if (this.player && this.player.video) {
              const { top } = this.player.video.getBoundingClientRect()
              scrollIt(window.pageYOffset + top, 400)
            }
            this.setState(() => ({
              playing: true,
            }))
          }}
          onPause={() => {
            this.setState(() => ({
              ended: false,
              playing: false,
            }))
          }}
          onProgress={(progress) => {
            if (loop) {
              return
            }

            if (
              progress > this.props.endScroll &&
              !ended &&
              videoHeight &&
              !(this.player && this.player.scrubbing)
            ) {
              this.setState(
                () => ({ ended: true }),
                () => {
                  const duration = 800

                  let top = 0
                  if (this.player && this.player.video) {
                    top =
                      window.pageYOffset +
                      this.player.video.getBoundingClientRect().top
                  }

                  scrollIt(
                    top +
                      Math.min(
                        this.state.videoHeight,
                        this.state.windowHeight * MAX_HEIGHT,
                      ) -
                      HEADER_HEIGHT +
                      10,
                    duration,
                  )
                  setTimeout(() => {
                    this.setState(() => ({
                      playing: false,
                    }))
                  }, duration / 2)
                },
              )
            }
            if (progress > 0.999 && !cover) {
              this.setState(() => ({ cover: true }))
            }
          }}
          style={heightStyle.height ? heightStyle : { height: '100%' }}
        />
      </div>
    )
  }
}

export default VideoCover
