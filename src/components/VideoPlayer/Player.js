import React, { Component } from 'react'
import PropTypes from 'prop-types'
import colors from '../../theme/colors'
import { css, merge } from 'glamor'
import { breakoutStyles } from '../Center'
import { InlineSpinner } from '../Spinner'
import Play from './Icons/Play'
import Volume from './Icons/Volume'
import Subtitles from './Icons/Subtitles'

const ZINDEX_VIDEOPLAYER_ICONS = 6
const ZINDEX_VIDEOPLAYER_SCRUB = 3
const PROGRESS_HEIGHT = 4

const styles = {
  wrapper: css({
    position: 'relative',
    lineHeight: 0,
    marginBottom: PROGRESS_HEIGHT
  }),
  video: css({
    width: '100%',
    height: 'auto',
    transition: 'height 200ms',
    '::-webkit-media-controls-panel': {
      display: 'none !important'
    },
    '::--webkit-media-controls-play-button': {
      display: 'none !important'
    },
    '::-webkit-media-controls-start-playback-button': {
      display: 'none !important'
    }
  }),
  controls: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    cursor: 'pointer',
    transition: 'opacity 200ms'
  }),
  play: css({
    position: 'absolute',
    top: '50%',
    left: '5%',
    right: '5%',
    marginTop: -18,
    textAlign: 'center',
    transition: 'opacity 200ms'
  }),
  progress: css({
    position: 'absolute',
    backgroundColor: colors.primary,
    bottom: -PROGRESS_HEIGHT,
    left: 0,
    height: PROGRESS_HEIGHT
  }),
  icons: css({
    position: 'absolute',
    zIndex: ZINDEX_VIDEOPLAYER_ICONS,
    right: 10,
    bottom: 10,
    cursor: 'pointer'
  }),
  scrub: css({
    zIndex: ZINDEX_VIDEOPLAYER_SCRUB,
    position: 'absolute',
    height: '10%',
    bottom: -PROGRESS_HEIGHT,
    left: 0,
    right: 0,
    cursor: 'ew-resize'
  })
}

let globalState = {
  playingRef: undefined,
  muted: false,
  subtitles: false,
  instances: []
}

class VideoPlayer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      playing: false,
      progress: 0,
      muted: globalState.muted,
      subtitles: props.subtitles || globalState.subtitles,
      loading: false
    }

    this.updateProgress = () => {
      const { video } = this
      if (!video) {
        return
      }
      this.setState(() => {
        const progress = video.currentTime / video.duration
        this.props.onProgress && this.props.onProgress(progress)
        return {
          progress
        }
      })
    }
    this.syncProgress = () => {
      this.readTimeout = setTimeout(() => {
        this.updateProgress()
        this.syncProgress()
      }, 16)
    }
    this.ref = ref => {
      this.video = ref
    }
    this.onPlay = () => {
      if (globalState.playingRef && globalState.playingRef !== this.video) {
        globalState.playingRef.pause()
      }
      globalState.playingRef = this.video
      this.setState(() => ({
        playing: true,
        loading: false
      }))
      this.syncProgress()
      this.props.onPlay && this.props.onPlay()
    }
    this.onPause = () => {
      this.setState(() => ({
        playing: false
      }))
      clearTimeout(this.readTimeout)
      this.props.onPause && this.props.onPause()
    }
    this.onLoadStart = () => {
      this.setState(() => ({
        loading: true
      }))
    }
    this.onCanPlay = () => {
      this.setState(() => ({
        loading: false
      }))
    }
    this.onLoadedMetaData = () => {
      this.setTextTracksMode()
    }
    this.scrubRef = ref => {
      this.scrubber = ref
    }
    this.scrub = event => {
      const { scrubber, video } = this
      if (this.scrubbing && scrubber && video && video.duration) {
        event.preventDefault()
        const rect = scrubber.getBoundingClientRect()

        let currentEvent = event
        if (currentEvent.nativeEvent) {
          currentEvent = event.nativeEvent
        }
        while (currentEvent.sourceEvent) {
          currentEvent = currentEvent.sourceEvent
        }
        if (currentEvent.changedTouches) {
          currentEvent = currentEvent.changedTouches[0]
        }

        const progress = Math.min(
          1,
          Math.max((currentEvent.clientX - rect.left) / rect.width, 0)
        )
        video.currentTime = video.duration * progress
        this.updateProgress()
      }
    }
    this.scrubStart = event => {
      this.scrubbing = true
      if (event.type === 'mousedown') {
        const up = e => {
          this.scrubEnd(e)
          document.removeEventListener('mousemove', this.scrub)
          document.removeEventListener('mouseup', up)
        }
        document.addEventListener('mousemove', this.scrub)
        document.addEventListener('mouseup', up)
      }
      this.scrub(event)
    }
    this.scrubEnd = event => {
      this.scrub(event)
      this.scrubbing = false
    }
    this.setInstanceState = state => {
      this.setState(state)
    }
  }
  toggle() {
    const { video } = this
    if (video) {
      if (video.paused || video.ended) {
        this.play()
      } else {
        this.pause()
      }
    }
  }
  play() {
    const { video } = this
    video && video.play()
  }
  pause() {
    const { video } = this
    video && video.pause()
  }
  setTextTracksMode() {
    const { subtitles } = this.state
    const { src } = this.props

    if (!this.video || !src.subtitles || subtitles === this._textTrackMode) {
      return
    }
    if (this.video.textTracks && this.video.textTracks.length) {
      this.video.textTracks[0].mode = subtitles ? 'showing' : 'hidden'
      this._textTrackMode = subtitles
    }
  }
  componentDidMount() {
    globalState.instances.push(this.setInstanceState)
    if (!this.video) {
      return
    }
    this.video.addEventListener('play', this.onPlay)
    this.video.addEventListener('pause', this.onPause)
    this.video.addEventListener('loadstart', this.onLoadStart)
    this.video.addEventListener('canplay', this.onCanPlay)
    this.video.addEventListener('canplaythrough', this.onCanPlay)
    this.video.addEventListener('loadedmetadata', this.onLoadedMetaData)

    this.setTextTracksMode()
  }
  componentDidUpdate() {
    this.setTextTracksMode()
  }
  componentWillUnmount() {
    globalState.instances = globalState.instances.filter(
      setter => setter !== this.setInstanceState
    )
    if (globalState.playingRef === this.video) {
      globalState.playingRef = undefined
    }

    this.video.removeEventListener('play', this.onPlay)
    this.video.removeEventListener('pause', this.onPause)
    this.video.removeEventListener('loadstart', this.onLoadStart)
    this.video.removeEventListener('progress', this.onProgress)
    this.video.removeEventListener('canplay', this.onCanPlay)
    this.video.removeEventListener('canplaythrough', this.onCanPlay)
    this.video.removeEventListener('loadedmetadata', this.onLoadedMetaData)
  }
  render() {
    const { src, showPlay, size, forceMuted, autoPlay, loop, attributes = {} } = this.props
    const { playing, progress, muted, subtitles, loading } = this.state

    return (
      <div {...merge(styles.wrapper, breakoutStyles[size])}>
        <video
          {...styles.video}
          {...attributes}
          style={this.props.style}
          autoPlay={autoPlay}
          muted={forceMuted !== undefined ? forceMuted : muted}
          loop={loop}
          ref={this.ref}
          crossOrigin="anonymous"
          poster={src.thumbnail}
        >
          <source src={src.hls} type="application/x-mpegURL" />
          <source src={src.mp4} type="video/mp4" />
          {!!src.subtitles && (
            <track
              label="Deutsch"
              kind="subtitles"
              srcLang="de"
              src={src.subtitles}
              default
            />
          )}
        </video>
        <div
          {...styles.controls}
          style={{ opacity: playing ? 0 : 1 }}
          onClick={() => this.toggle()}
        >
          <div
            {...styles.play}
            style={{
              opacity: !showPlay || playing ? 0 : 1
            }}
          >
            <Play />
          </div>
          <div {...styles.icons}>
            {loading && <InlineSpinner size={25} />}{' '}
            {!!src.subtitles && (
              <span
                role="button"
                title={`Untertitel ${subtitles ? 'an' : 'aus'}`}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  const next = {
                    subtitles: !subtitles
                  }
                  globalState.subtitles = next.subtitles
                  globalState.instances.forEach(setter => {
                    setter(next)
                  })
                }}
              >
                <Subtitles off={!subtitles} />
              </span>
            )}{' '}
            {forceMuted === undefined && <span
              role="button"
              title={`Audio ${muted ? 'aus' : 'an'}`}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                const next = {
                  muted: !muted
                }
                globalState.muted = next.muted
                globalState.instances.forEach(setter => {
                  setter(next)
                })
              }}
            >
              <Volume off={muted} />
            </span>}
          </div>
        </div>
        <div {...styles.progress} style={{ width: `${progress * 100}%` }} />
        <div
          {...styles.scrub}
          ref={this.scrubRef}
          onTouchStart={this.scrubStart}
          onTouchMove={this.scrub}
          onTouchEnd={this.scrubEnd}
          onMouseDown={this.scrubStart}
        />
      </div>
    )
  }
}

VideoPlayer.propTypes = {
  src: PropTypes.shape({
    hls: PropTypes.string.isRequired,
    mp4: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    subtitles: (props, propName, componentName) => {
      const value = props[propName]
      if (value && value.match(/^https?:/)) {
        return new Error(
`Invalid prop \`${propName}\` supplied to
\`${componentName}\`. Subtitles should be loaded from a relative or absolute path.
CrossOrigin subtitles do not work in older browsers.'`
        );
      }
    },
  }),
  size: PropTypes.oneOf(Object.keys(breakoutStyles)),
  showPlay: PropTypes.bool,
  loop: PropTypes.bool,
  // ignores global muted state and sets muted
  forceMuted: PropTypes.bool,
  // arbitrary attributes like playsinline, specific ones win
  attributes: PropTypes.object
}

VideoPlayer.defaultProps = {
  showPlay: true,
  size: undefined
}

export default VideoPlayer
