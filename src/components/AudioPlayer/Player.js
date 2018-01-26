import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { css, merge } from 'glamor'
import { timeFormat } from '../../lib/timeFormat'
import { breakoutStyles } from '../Center'
import { InlineSpinner } from '../Spinner'
import Volume from '../VideoPlayer/Icons/Volume'
import Play from 'react-icons/lib/md/play-arrow'
import Pause from 'react-icons/lib/md/pause'

const ZINDEX_AUDIOPLAYER_ICONS = 6
const ZINDEX_AUDIOPLAYER_SCRUB = 3
const ZINDEX_AUDIOPLAYER_PROGRESS = 2
const ZINDEX_AUDIOPLAYER_BUFFER = 1
const ZINDEX_AUDIOPLAYER_TOTAL = 0
const PROGRESS_HEIGHT = 4

const hoursDurationFormat = timeFormat('%-H:%M:%S')
const minutesDurationFormat = timeFormat('%-M:%S')

const barStyle = {
  position: 'absolute',
  height: PROGRESS_HEIGHT,
  top: -PROGRESS_HEIGHT,
  left: 0,
  right: 0
}

const styles = {
  wrapper: css({
    position: 'relative',
    height: '40px',
    lineHeight: 0
  }),
  audio: css({
    height: 0,
    width: '100%',
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
    top: 10,
    left: 0,
    right: 0,
    cursor: 'pointer',
    height: '25px'
  }),
  play: css({
    position: 'absolute',
    top: '50%',
    left: 0,
    marginTop: -15,
    textAlign: 'center'
  }),
  mute: css({
    position: 'absolute',
    top: '50%',
    left: 40,
    marginTop: -12,
    textAlign: 'center'
  }),
  progress: css({
    position: 'absolute',
    zIndex: ZINDEX_AUDIOPLAYER_PROGRESS,
    backgroundColor: colors.primary,
    top: -PROGRESS_HEIGHT,
    left: 0,
    height: PROGRESS_HEIGHT
  }),
  time: css({
    position: 'absolute',
    zIndex: ZINDEX_AUDIOPLAYER_ICONS,
    right: 10,
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '25px',
    height: '30px',
    color: colors.text,
    [mUp]: {
      fontSize: '19px'
    }
  }),
  scrub: css({
    ...barStyle,
    zIndex: ZINDEX_AUDIOPLAYER_SCRUB,
    cursor: 'ew-resize'
  }),
  buffer: css({
    ...barStyle,
    zIndex: ZINDEX_AUDIOPLAYER_BUFFER
  }),
  totalDuration: css({
    ...barStyle,
    backgroundColor: '#e8e8ed',
    zIndex: ZINDEX_AUDIOPLAYER_TOTAL
  }),
  timeRange: css({
    backgroundColor: '#bebdcb',
    position: 'absolute',
    height: PROGRESS_HEIGHT
  })
}

let globalState = {
  playingRef: undefined,
  muted: false,
  instances: []
}

const getFormattedTime = secs => {
  let totalSeconds = secs
  let hours = Math.floor(totalSeconds / 3600)
  totalSeconds %= 3600
  let minutes = Math.floor(totalSeconds / 60)
  let seconds = totalSeconds % 60
  let dateTime = new Date(null)
  !!hours && dateTime.setHours(hours)
  !!minutes && dateTime.setMinutes(minutes)
  !!seconds && dateTime.setSeconds(seconds)
  return !!hours
    ? hoursDurationFormat(dateTime)
    : minutesDurationFormat(dateTime)
}

class AudioPlayer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      playing: false,
      progress: 0,
      muted: globalState.muted,
      loading: false,
      buffered: null
    }

    this.updateProgress = () => {
      const { audio } = this
      if (!audio) {
        return
      }
      this.setState(() => {
        const progress = audio.currentTime / audio.duration
        this.props.onProgress && this.props.onProgress(progress)
        return {
          progress,
          buffered: audio.buffered
        }
      })
      this.formattedCurrentTime = getFormattedTime(audio.currentTime)
    }
    this.syncProgress = () => {
      this.readTimeout = setTimeout(() => {
        this.updateProgress()
        this.syncProgress()
      }, 16)
    }
    this.ref = ref => {
      this.audio = ref
    }
    this.onPlay = () => {
      if (globalState.playingRef && globalState.playingRef !== this.audio) {
        globalState.playingRef.pause()
      }
      globalState.playingRef = this.audio
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
    this.onLoadedMetaData = () => {}
    this.scrubRef = ref => {
      this.scrubber = ref
    }
    this.scrub = event => {
      const { scrubber, audio } = this
      if (this.scrubbing && scrubber && audio && audio.duration) {
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
        audio.currentTime = audio.duration * progress
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
    const { audio } = this
    if (audio) {
      if (audio.paused || audio.ended) {
        this.play()
      } else {
        this.pause()
      }
    }
  }
  play() {
    const { audio } = this
    audio && audio.play()
  }
  pause() {
    const { audio } = this
    audio && audio.pause()
  }
  setFormattedTimes() {
    if (!this.audio || !this.audio.duration) {
      return
    }
    this.formattedDuration = getFormattedTime(this.audio.duration)
    if (!this.formattedCurrentTime) {
      this.formattedCurrentTime = getFormattedTime(0)
    }
  }
  componentDidMount() {
    globalState.instances.push(this.setInstanceState)
    if (!this.audio) {
      return
    }
    this.audio.addEventListener('play', this.onPlay)
    this.audio.addEventListener('pause', this.onPause)
    this.audio.addEventListener('loadstart', this.onLoadStart)
    this.audio.addEventListener('canplay', this.onCanPlay)
    this.audio.addEventListener('canplaythrough', this.onCanPlay)
    this.audio.addEventListener('loadedmetadata', this.onLoadedMetaData)

    this.setFormattedTimes()

    if (this.audio && !this.audio.paused) {
      this.onPlay()
    }
  }
  componentDidUpdate() {
    this.setFormattedTimes()
  }
  componentWillUnmount() {
    globalState.instances = globalState.instances.filter(
      setter => setter !== this.setInstanceState
    )
    if (globalState.playingRef === this.audio) {
      globalState.playingRef = undefined
    }

    this.audio.removeEventListener('play', this.onPlay)
    this.audio.removeEventListener('pause', this.onPause)
    this.audio.removeEventListener('loadstart', this.onLoadStart)
    this.audio.removeEventListener('progress', this.onProgress)
    this.audio.removeEventListener('canplay', this.onCanPlay)
    this.audio.removeEventListener('canplaythrough', this.onCanPlay)
    this.audio.removeEventListener('loadedmetadata', this.onLoadedMetaData)
  }
  render() {
    const { src, size, attributes = {} } = this.props
    const { playing, progress, muted, loading, buffered } = this.state
    const isVideo = src.mp4 || src.hls

    return (
      <div {...merge(styles.wrapper, breakoutStyles[size])}>
        {!isVideo && <audio
          {...styles.audio}
          {...attributes}
          style={this.props.style}
          muted={muted}
          ref={this.ref}
          crossOrigin="anonymous"
        >
          {src.mp3 && <source src={src.mp3} type="audio/mpeg" />}
          {src.aac && <source src={src.aac} type="audio/mp4" />}
          {src.ogg && <source src={src.ogg} type="audio/ogg" />}
        </audio>}
        {isVideo && <video
          {...styles.audio}
          {...attributes}
          style={this.props.style}
          muted={muted}
          ref={this.ref}
          crossOrigin="anonymous"
        >
          {src.hls && <source src={src.hls} type="application/x-mpegURL" />}
          {src.mp4 && <source src={src.mp4} type="video/mp4" />}
        </video>}
        <div {...styles.controls}>
          <div {...styles.play} onClick={loading ? null : () => this.toggle()}>
            {!playing && <Play size={30} fill={loading ? colors.disabled : '#000'} />}
            {playing && <Pause size={30} fill="#000" />}
          </div>
          <div {...styles.mute}>
            <span
              role="button"
              title={`Stummschaltung ${muted ? 'an' : 'aus'}`}
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
              <Volume off={muted} fill="#000" />
            </span>
          </div>
          <div {...styles.time}>
            {loading && <InlineSpinner size={25} />}
            {this.formattedCurrentTime &&
            this.formattedDuration && (
              <Fragment>
                {this.formattedCurrentTime}
                {' / '}
                {this.formattedDuration}
              </Fragment>
            )}
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
        <div {...styles.buffer}>
          {this.audio &&
            buffered &&
            !!buffered.length &&
            Array.from(Array(buffered.length).keys()).map(index => (
              <span
                key={index}
                {...styles.timeRange}
                style={{
                  left: `${buffered.start(index) / this.audio.duration * 100}%`,
                  width: `${(buffered.end(index) - buffered.start(index)) /
                    this.audio.duration *
                    100}%`
                }}
              />
            ))}
        </div>
        <div {...styles.totalDuration} />
      </div>
    )
  }
}

AudioPlayer.propTypes = {
  src: PropTypes.shape({
    mp3: PropTypes.string,
    aac: PropTypes.string,
    ogg: PropTypes.string,
    hls: PropTypes.string,
    mp4: PropTypes.string
  }),
  size: PropTypes.oneOf(Object.keys(breakoutStyles)),
  attributes: PropTypes.object
}

AudioPlayer.defaultProps = {
  size: undefined
}

export default AudioPlayer
