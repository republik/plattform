import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'

import { ellipsize } from '../../lib/styleMixins'
import warn from '../../lib/warn'
import globalState from '../../lib/globalMediaState'

import { breakoutStyles } from '../Center'
import { InlineSpinner } from '../Spinner'
import { sansSerifRegular12, sansSerifRegular15 } from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  ReplayIcon,
  DownloadIcon,
  CloseIcon,
} from '../Icons'
import { useColorContext } from '../Colors/useColorContext'

import Scrubber from './Scrubber'
import ExpandableAudioPlayer from './ExpandableAudioPlayer'

import {
  ZINDEX_AUDIOPLAYER_ICONS,
  hoursDurationFormat,
  minutesDurationFormat,
  PROGRESS_HEIGHT,
  DefaultLink,
  progressbarStyle,
} from './constants'

const CONTROLS_HEIGHT = 25
const ICON_SPACING = 8

const SIZE = {
  play: 30,
  close: 30,
  download: 22,
  forward: 22,
  replay: 22,
}

const buttonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  padding: 0,
}

const styles = {
  wrapper: css({
    position: 'relative',
    lineHeight: 0,
    ':focus': {
      outline: 'none',
    },
  }),
  audio: css({
    height: 0,
    width: '100%',
    '::-webkit-media-controls-panel': {
      display: 'none !important',
    },
    '::--webkit-media-controls-play-button': {
      display: 'none !important',
    },
    '::-webkit-media-controls-start-playback-button': {
      display: 'none !important',
    },
  }),
  controls: css({
    position: 'absolute',
    cursor: 'pointer',
    height: `${CONTROLS_HEIGHT}px`,
  }),
  buttons: css({
    position: 'absolute',
    top: '50%',
    left: 0,
    marginTop: -15,
    textAlign: 'center',
  }),
  button: css({
    ...buttonStyle,
  }),
  download: css({
    position: 'absolute',
    top: '50%',
    left: SIZE.play + SIZE.replay + SIZE.forward + ICON_SPACING,
    marginTop: -10,
    textAlign: 'center',
  }),
  close: css({
    ...buttonStyle,
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -14,
    textAlign: 'center',
  }),
  scrubberTop: css({
    ...progressbarStyle,
    top: -PROGRESS_HEIGHT,
    zIndex: ZINDEX_AUDIOPLAYER_ICONS,
  }),
  scrubberBottom: css({
    ...progressbarStyle,
    bottom: -PROGRESS_HEIGHT,
    zIndex: ZINDEX_AUDIOPLAYER_ICONS,
  }),
  uiText: css({
    position: 'absolute',
    zIndex: ZINDEX_AUDIOPLAYER_ICONS,
    top: 1,
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '25px',
    height: '30px',
    [mUp]: {
      fontSize: '19px',
    },
  }),
  time: css({
    ...ellipsize,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    fontSize: '19px',
  }),
  sourceError: css({
    height: '25px',
    ...ellipsize,
    ...sansSerifRegular12,
    lineHeight: '25px',
    [mUp]: {
      ...sansSerifRegular15,
      lineHeight: '25px',
    },
  }),
  retry: css({
    cursor: 'pointer',
  }),
}

export const getFormattedTime = (secs) => {
  let totalSeconds = secs
  let hours = Math.floor(totalSeconds / 3600)
  totalSeconds %= 3600
  let minutes = Math.floor(totalSeconds / 60)
  let seconds = totalSeconds % 60
  let dateTime = new Date(null)
  !!hours && dateTime.setHours(hours)
  !!minutes && dateTime.setMinutes(minutes)
  !!seconds && dateTime.setSeconds(seconds)
  return hours ? hoursDurationFormat(dateTime) : minutesDurationFormat(dateTime)
}

class AudioPlayer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      canSetTime: false,
      playing: false,
      progress: 0,
      loading: false,
      buffered: null,
      sourceError: false,
    }

    this.updateProgress = () => {
      const { audio } = this
      if (!audio) {
        return
      }
      const progress = audio.currentTime / audio.duration
      this.props.onProgress && this.props.onProgress(progress, audio)
      this.context.saveMediaProgress &&
        this.context.saveMediaProgress(this.props, audio)
      this.setState({
        progress,
        buffered: audio.buffered,
      })
    }
    this.syncProgress = () => {
      clearTimeout(this.readTimeout)
      this.readTimeout = setTimeout(() => {
        this.updateProgress()
        this.syncProgress()
      }, 250)
    }
    this.containerRef = (ref) => {
      this.container = ref
    }
    this.ref = (ref) => {
      this.audio = ref
    }
    this.onPlay = () => {
      if (globalState.playingRef && globalState.playingRef !== this.audio) {
        globalState.playingRef.pause()
      }
      globalState.playingRef = this.audio
      this.setState(() => ({
        playing: true,
        loading: false,
      }))
      this.syncProgress()
      this.props.onPlay && this.props.onPlay()
    }
    this.onPause = () => {
      this.setState(() => ({
        playing: false,
      }))
      clearTimeout(this.readTimeout)
      this.updateProgress()
      this.props.onPause && this.props.onPause()
    }
    this.onLoadStart = () => {
      this.setState(() => ({
        loading: true,
      }))
    }
    this.setTime = (time = 0) => {
      if (this.audio && this.audio.currentTime !== time) {
        this.audio.currentTime = time
        this.updateProgress()
      }
    }

    this.isSeekable = new Promise((resolve) => {
      this.onSeekable = resolve
    })
    this.onMetaData = () => {
      this.setState(() => ({
        loading: false,
      }))
    }
    this.onCanSeek = () => {
      this.setState(() => ({
        canSetTime: true,
        loading: false,
        sourceError: false,
      }))
      this.onSeekable()
    }
    this.onSourceError = () => {
      this.setState(() => ({
        sourceError: true,
        loading: false,
      }))
    }
    this.scrubRef = (ref) => {
      this.scrubber = ref
    }
    this.scrub = (event) => {
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
          Math.max((currentEvent.clientX - rect.left) / rect.width, 0),
        )
        audio.currentTime = audio.duration * progress
        this.updateProgress()
      }
    }
    this.scrubStart = (event) => {
      this.scrubbing = true
      if (event.type === 'mousedown') {
        const up = (e) => {
          this.scrubEnd(e)
          document.removeEventListener('mousemove', this.scrub)
          document.removeEventListener('mouseup', up)
        }
        document.addEventListener('mousemove', this.scrub)
        document.addEventListener('mouseup', up)
      }
      this.scrub(event)
    }
    this.scrubEnd = (event) => {
      this.scrub(event)
      this.scrubbing = false
    }
    this.setInstanceState = (state) => {
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
    this.setAudioPlaybackRate = () => {
      if (this.audio) {
        this.audio.playbackRate = this.props.playbackRate
      }
    }

    this.reload = () => {
      const { audio } = this
      if (audio) {
        this.setState(() => ({
          loading: true,
        }))
        audio.load()
      }
    }
  }

  play() {
    const { audio } = this
    const playPromise = audio && audio.play()
    if (playPromise) {
      playPromise.catch((e) => {
        if (this.state.playing) {
          this.setState({ playing: false })
        }
        warn('[AudioPlayer]', e.message)
      })
    }
  }
  pause() {
    const { audio } = this
    audio && audio.pause()
  }
  getStartTime() {
    if (this.context.getMediaProgress) {
      return this.context.getMediaProgress(this.props).catch(() => {
        return // ignore errors
      })
    }
    return Promise.resolve()
  }

  componentDidMount() {
    globalState.instances.push(this.setInstanceState)
    if (!this.audio) {
      return
    }

    this.audio.addEventListener('play', this.onPlay)
    this.audio.addEventListener('pause', this.onPause)
    this.audio.addEventListener('loadstart', this.onLoadStart)
    this.audio.addEventListener('canplay', this.onCanSeek)
    this.audio.addEventListener('canplaythrough', this.onCanSeek)
    this.audio.addEventListener('loadedmetadata', this.onMetaData)

    this.getStartTime().then((startTime) => {
      const hasStartTime = startTime !== undefined && startTime !== null
      const runInitialCmds = () => {
        this.setAudioPlaybackRate()
        if (hasStartTime) {
          this.setTime(startTime)
        }
        if (this.props.autoPlay) {
          this.container && this.container.focus()
          this.play()
        }
      }
      if (this.state.canSetTime) {
        runInitialCmds()
      } else {
        this.isSeekable.then(runInitialCmds)
        if (hasStartTime || this.props.autoPlay) {
          // ensure load process is started e.g. on battery devices
          this.audio.load()
        }
      }
    })
    if (this.audio.readyState >= 1) {
      this.onCanSeek()
    }
    this.setAudioPlaybackRate()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.playbackRate != this.props.playbackRate) {
      this.setAudioPlaybackRate()
    }
  }
  componentWillUnmount() {
    clearTimeout(this.readTimeout)
    globalState.instances = globalState.instances.filter(
      (setter) => setter !== this.setInstanceState,
    )
    if (globalState.playingRef === this.audio) {
      globalState.playingRef = undefined
    }

    this.audio.removeEventListener('play', this.onPlay)
    this.audio.removeEventListener('pause', this.onPause)
    this.audio.removeEventListener('loadstart', this.onLoadStart)
    this.audio.removeEventListener('progress', this.onProgress)
    this.audio.removeEventListener('canplay', this.onCanSeek)
    this.audio.removeEventListener('canplaythrough', this.onCanSeek)
    this.audio.removeEventListener('loadedmetadata', this.onMetaData)
  }
  render() {
    const {
      src,
      size,
      attributes = {},
      style,
      t,
      height: heightProp,
      closeHandler,
      download,
      scrubberPosition,
      timePosition,
      controlsPadding,
      autoPlay,
      title,
      sourcePath,
      colorScheme,
      Link = DefaultLink,
      playbackRate,
      setPlaybackRate,
    } = this.props
    const { canSetTime, playing, progress, loading, buffered, sourceError } =
      this.state
    const isVideo = src.mp4 || src.hls
    const leftIconsWidth =
      SIZE.play +
      SIZE.replay +
      SIZE.forward +
      (download ? SIZE.download + ICON_SPACING : 0)
    const rightIconsWidth = closeHandler ? SIZE.close : 0
    const uiTextStyle = {
      maxWidth: `calc(100% - ${leftIconsWidth + rightIconsWidth + 20}px)`,
      left: timePosition === 'left' ? leftIconsWidth + 10 : 'auto',
      right: timePosition === 'right' ? rightIconsWidth + 10 : 'auto',
      top: loading ? '0px' : '1px',
    }

    let timeRanges = []
    if (buffered && buffered.length) {
      for (let i = 0; i < buffered.length; i++) {
        timeRanges.push({ start: buffered.start(i), end: buffered.end(i) })
      }
    }

    const formattedCurrentTime =
      !!this.audio?.currentTime &&
      getFormattedTime(this.audio.currentTime / this.props.playbackRate)
    const formattedDuration =
      !!this.audio?.duration &&
      getFormattedTime(this.audio.duration / this.props.playbackRate)

    const playbackElement = isVideo ? (
      <video
        preload={autoPlay ? 'auto' : undefined}
        {...styles.audio}
        {...attributes}
        ref={this.ref}
        crossOrigin='anonymous'
        playsInline
        webkit-playsinline=''
      >
        {src.hls && (
          <source
            src={src.hls}
            type='application/x-mpegURL'
            onError={this.onSourceError}
          />
        )}
        {src.mp4 && (
          <source src={src.mp4} type='video/mp4' onError={this.onSourceError} />
        )}
      </video>
    ) : (
      <audio
        preload={autoPlay ? 'auto' : undefined}
        {...styles.audio}
        {...attributes}
        ref={this.ref}
        crossOrigin='anonymous'
      >
        {src.mp3 && (
          <source
            src={src.mp3}
            type='audio/mpeg'
            onError={this.onSourceError}
          />
        )}
        {src.aac && (
          <source src={src.aac} type='audio/mp4' onError={this.onSourceError} />
        )}
        {src.ogg && (
          <source src={src.ogg} type='audio/ogg' onError={this.onSourceError} />
        )}
      </audio>
    )

    if (this.props.mode === 'overlay') {
      return (
        <ExpandableAudioPlayer
          containerRef={this.containerRef}
          scrubRef={this.scrubRef}
          audio={this.audio}
          playbackElement={playbackElement}
          playing={playing}
          canSetTime={canSetTime}
          progress={progress}
          loading={loading}
          sourceError={sourceError}
          playbackRate={playbackRate}
          setPlaybackRate={setPlaybackRate}
          toggle={this.toggle}
          reload={this.reload}
          scrubStart={this.scrubStart}
          scrub={this.scrub}
          scrubEnd={this.scrubEnd}
          timeRanges={timeRanges}
          closeHandler={closeHandler}
          t={t}
          Link={Link}
          title={title}
          sourcePath={sourcePath}
          formattedCurrentTime={formattedCurrentTime}
          formattedDuration={formattedDuration}
          setTime={this.setTime}
          download={download}
          src={src}
          height={height}
        />
      )
    }

    const height = heightProp || 44
    return (
      <div
        {...merge(styles.wrapper, breakoutStyles[size])}
        ref={this.containerRef}
        style={{ ...style, height: `${height}px` }}
        tabIndex='0'
        role='region'
        aria-label={t('styleguide/AudioPlayer/aria')}
      >
        {playbackElement}
        <div
          {...styles.controls}
          style={{
            top: Math.ceil((height - CONTROLS_HEIGHT) / 2),
            left: controlsPadding,
            right: controlsPadding,
          }}
        >
          <div {...styles.buttons}>
            <button
              {...styles.button}
              onClick={
                canSetTime
                  ? () => {
                      this.setTime(this.audio.currentTime - 10)
                    }
                  : null
              }
              title={t('styleguide/AudioPlayer/partialrewind')}
            >
              <ReplayIcon
                size={SIZE.replay}
                {...(canSetTime && progress > 0
                  ? colorScheme.set('fill', 'text')
                  : colorScheme.set('fill', 'disabled'))}
              />
            </button>
            <button
              {...styles.button}
              onClick={this.toggle}
              title={t(`styleguide/AudioPlayer/${playing ? 'pause' : 'play'}`)}
              aria-live='assertive'
            >
              {playing ? (
                <PauseIcon
                  size={SIZE.play}
                  {...colorScheme.set(
                    'fill',
                    sourceError ? 'disabled' : 'text',
                  )}
                />
              ) : (
                <PlayIcon
                  size={SIZE.play}
                  {...colorScheme.set(
                    'fill',
                    sourceError ? 'disabled' : 'text',
                  )}
                />
              )}
            </button>
            <button
              {...styles.button}
              onClick={
                canSetTime
                  ? () => {
                      this.setTime(this.audio.currentTime + 30)
                    }
                  : null
              }
              title={t('styleguide/AudioPlayer/partialfastforward')}
            >
              <ForwardIcon
                size={SIZE.forward}
                {...(canSetTime && progress > 0
                  ? colorScheme.set('fill', 'text')
                  : colorScheme.set('fill', 'disabled'))}
              />
            </button>
          </div>
          {download && !sourceError && (
            <div {...styles.download}>
              <a
                href={src.mp3 || src.aac || src.mp4}
                download
                title={t('styleguide/AudioPlayer/download')}
              >
                <DownloadIcon
                  size={SIZE.download}
                  {...colorScheme.set('fill', 'text')}
                />
              </a>
            </div>
          )}
          {closeHandler && (
            <button
              title={t('styleguide/AudioPlayer/close')}
              {...styles.close}
              onClick={closeHandler}
            >
              <CloseIcon
                size={SIZE.close}
                {...colorScheme.set('fill', 'text')}
              />
            </button>
          )}
          <div
            {...styles.uiText}
            {...colorScheme.set('color', 'text')}
            style={uiTextStyle}
          >
            {loading ? (
              <InlineSpinner
                size={25}
                title={t('styleguide/AudioPlayer/loading')}
              />
            ) : sourceError ? (
              <div
                {...styles.sourceError}
                {...colorScheme.set('color', 'error')}
              >
                {t('styleguide/AudioPlayer/sourceError')}{' '}
                <span onClick={() => this.reload()} {...styles.retry}>
                  {t('styleguide/AudioPlayer/sourceErrorTryAgain')}
                </span>
              </div>
            ) : (
              <div
                {...styles.time}
                {...colorScheme.set('color', 'textSoft')}
                tabIndex='0'
              >
                {formattedCurrentTime}
                {formattedCurrentTime && formattedDuration && ' / '}
                {formattedDuration}
              </div>
            )}
          </div>
        </div>
        <div
          {...(scrubberPosition === 'bottom'
            ? styles.scrubberBottom
            : styles.scrubberTop)}
        >
          <Scrubber
            ref={this.scrubRef}
            progress={progress}
            playing={playing}
            scrubStart={this.scrubStart}
            scrub={this.scrub}
            scrubEnd={this.scrubEnd}
            audio={this.audio}
            timeRanges={timeRanges}
          />
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
    mp4: PropTypes.string,
  }),
  autoPlay: PropTypes.bool,
  size: PropTypes.oneOf(Object.keys(breakoutStyles)),
  attributes: PropTypes.object,
  height: PropTypes.number,
  style: PropTypes.object,
  closeHandler: PropTypes.func,
  download: PropTypes.bool,
  scrubberPosition: PropTypes.oneOf(['top', 'bottom']),
  timePosition: PropTypes.oneOf(['left', 'right']),
  controlsPadding: PropTypes.number,
}

AudioPlayer.defaultProps = {
  autoPlay: false,
  size: undefined,
  style: {},
  download: false,
  scrubberPosition: 'top',
  timePosition: 'right',
  controlsPadding: 0,
  playbackRate: 1,
}

AudioPlayer.contextTypes = {
  getMediaProgress: PropTypes.func,
  saveMediaProgress: PropTypes.func,
}

const AudioPlayerWithColorContext = ({ ...props }) => {
  const [colorScheme] = useColorContext()
  return <AudioPlayer {...props} colorScheme={colorScheme} />
}

export default AudioPlayerWithColorContext
