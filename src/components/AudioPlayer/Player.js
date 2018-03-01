import React, { Component } from 'react'
import PropTypes from 'prop-types'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { css, merge } from 'glamor'
import { ellipsize } from '../../lib/styleMixins'
import { timeFormat } from '../../lib/timeFormat'
import { breakoutStyles } from '../Center'
import { InlineSpinner } from '../Spinner'
import { link, sansSerifRegular12, sansSerifRegular15 } from '../Typography/styles'
import Play from 'react-icons/lib/md/play-arrow'
import Pause from 'react-icons/lib/md/pause'
import Download from 'react-icons/lib/md/file-download'

const ZINDEX_AUDIOPLAYER_ICONS = 6
const ZINDEX_AUDIOPLAYER_SCRUB = 3
const ZINDEX_AUDIOPLAYER_PROGRESS = 2
const ZINDEX_AUDIOPLAYER_BUFFER = 1
const ZINDEX_AUDIOPLAYER_TOTAL = 0
const PROGRESS_HEIGHT = 4

const hoursDurationFormat = timeFormat('%-H:%M:%S')
const minutesDurationFormat = timeFormat('%-M:%S')

const PLAYER_HEIGHT = 44
const ICON_SPACING = 4

const SIZE = {
  play: 30,
  download: 22
}

const barStyle = {
  position: 'absolute',
  height: PROGRESS_HEIGHT,
  left: 0,
  right: 0
}

const styles = {
  wrapper: css({
    position: 'relative',
    height: `${PLAYER_HEIGHT}px`,
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
  download: css({
    position: 'absolute',
    top: '50%',
    left: SIZE.play + ICON_SPACING,
    marginTop: -10,
    textAlign: 'center'
  }),
  scrubberTop: css({
    ...barStyle,
    top: -PROGRESS_HEIGHT
  }),
  scrubberBottom: css({
    ...barStyle,
    bottom: -PROGRESS_HEIGHT
  }),
  progress: css({
    position: 'absolute',
    zIndex: ZINDEX_AUDIOPLAYER_PROGRESS,
    backgroundColor: colors.primary,
    left: 0,
    height: PROGRESS_HEIGHT
  }),
  time: css({
    position: 'absolute',
    zIndex: ZINDEX_AUDIOPLAYER_ICONS,
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
    height: 20,
    marginTop: -((20 + PROGRESS_HEIGHT) / 2),
    paddingTop: 20 / 2 - PROGRESS_HEIGHT / 2,
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
  }),
  sourceError: css({
    position: 'absolute',
    zIndex: ZINDEX_AUDIOPLAYER_ICONS,
    top: 0,
    right: 0,
    maxWidth: `calc(100% - ${PLAYER_HEIGHT}px)`,
    color: colors.disabled,
    height: '25px',
    ...ellipsize,
    ...sansSerifRegular12,
    lineHeight: '25px',
    [mUp]: {
      ...sansSerifRegular15,
      lineHeight: '25px',
    }
  }),
  retry: css({
    ...link,
    cursor: 'pointer'
  })
}

let globalState = {
  playingRef: undefined,
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
      playEnabled: false,
      playing: false,
      progress: 0,
      loading: false,
      buffered: null,
      sourceError: false
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
        playEnabled: true,
        loading: false,
        sourceError: false
      }))
    }
    this.onLoadedMetaData = () => {
      this.setState(() => ({
        playEnabled: true,  // iOS won't fire canPlay, so rely on meta data.
        loading: false,
        sourceError: false
      }))
    }
    this.onSourceError = () => {
      this.setState(() => ({
        sourceError: true,
        loading: false
      }))
    }
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
    this.toggle = () => {
      const { audio } = this
      if (audio) {
        if (audio.paused || audio.ended) {
          this.play()
        } else {
          this.pause()
        }
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
  reload() {
    const { audio } = this
    if (audio) {
      this.setState(() => ({
        loading: true
      }))
      audio.load()
    }
  }
  setFormattedTimes() {
    if (!this.audio || !this.audio.duration) {
      return
    }
    this.formattedDuration = getFormattedTime(this.audio.duration)
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
    const { src, size, attributes = {}, t, download, scrubberPosition, timePosition } = this.props
    const { playEnabled, playing, progress, loading, buffered, sourceError } = this.state
    const isVideo = src.mp4 || src.hls
    const uiTextPosition =
      timePosition === 'left'
        ? { left: SIZE.play + (download ? SIZE.download + ICON_SPACING : 0) + 10 }
        : { right: 10 }

    return (
      <div {...merge(styles.wrapper, breakoutStyles[size])}>
        {!isVideo && <audio
          {...styles.audio}
          {...attributes}
          ref={this.ref}
          onLoadedMetadata={this.onLoadedMetaData}
          crossOrigin="anonymous"
        >
          {src.mp3 && <source src={src.mp3} type="audio/mpeg" onError={this.onSourceError} />}
          {src.aac && <source src={src.aac} type="audio/mp4" onError={this.onSourceError} />}
          {src.ogg && <source src={src.ogg} type="audio/ogg" onError={this.onSourceError} />}
        </audio>}
        {isVideo && <video
          {...styles.audio}
          {...attributes}
          ref={this.ref}
          onLoadedMetadata={this.onLoadedMetaData}
          crossOrigin="anonymous"
          playsInline
        >
          {src.hls && <source src={src.hls} type="application/x-mpegURL" onError={this.onSourceError} />}
          {src.mp4 && <source src={src.mp4} type="video/mp4" onError={this.onSourceError} />}
        </video>}
        <div {...styles.controls}>
          <div {...styles.play} onClick={playEnabled ? this.toggle : null}>
            {!playing && <Play size={SIZE.play} fill={playEnabled ? '#000' : colors.disabled} />}
            {playing && <Pause size={SIZE.play} fill="#000" />}
          </div>
          {download && (
            <div {...styles.download}>
              {playEnabled && (
                <a href={src.mp3 || src.aac || src.mp4} download title={t('styleguide/AudioPlayer/download')}>
                  <Download size={SIZE.download} fill={'#000'} />
                </a>
              )}
              {!playEnabled && (
                <Download size={SIZE.download} fill={colors.disabled} />
              )}
            </div>
          )}
          <div {...styles.time} style={uiTextPosition}>
            {loading && <InlineSpinner size={25} />}
            {this.formattedCurrentTime && this.formattedCurrentTime}
            {this.formattedCurrentTime && this.formattedDuration && ' / '}
            {this.formattedDuration && this.formattedDuration}
          </div>
          {sourceError && !loading && <div {...styles.sourceError} style={uiTextPosition}>
          {t('styleguide/AudioPlayer/sourceError')}{' '}
            <span onClick={() => this.reload()} {...styles.retry}>
              {t('styleguide/AudioPlayer/sourceErrorTryAgain')}
            </span>
          </div>}
        </div>
        <div {...(scrubberPosition === 'bottom' ? styles.scrubberBottom : styles.scrubberTop)}>
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
  attributes: PropTypes.object,
  download: PropTypes.bool,
  scrubberPosition: PropTypes.oneOf(['top', 'bottom']),
  timePosition: PropTypes.oneOf(['left', 'right'])
}

AudioPlayer.defaultProps = {
  size: undefined,
  download: false,
  scrubberPosition: 'top',
  timePosition: 'right'
}

export default AudioPlayer
