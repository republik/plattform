import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import colors from '../../theme/colors'
import zIndex from '../../theme/zIndex'
import { css, merge } from 'glamor'
import { breakoutStyles } from '../Center'
import { InlineSpinner } from '../Spinner'

import { setupFullscreen } from './fullscreen'
import Fullscreen from './Icons/Fullscreen'
import Play from './Icons/Play'
import Rewind from './Icons/Rewind'
import Volume from './Icons/Volume'
import Subtitles from './Icons/Subtitles'
import { sansSerifRegular18 } from '../Typography/styles'
import { getFormattedTime } from '../AudioPlayer/Player'

import warn from '../../lib/warn'
import globalState, { parseTimeHash } from '../../lib/globalMediaState'

const ZINDEX_VIDEOPLAYER_ICONS = 6
const ZINDEX_VIDEOPLAYER_SCRUB = 3
const PROGRESS_HEIGHT = 4

const styles = {
  fullWindow: css({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: zIndex.foreground,
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }),
  wrapper: css({
    position: 'relative',
    lineHeight: 0,
    marginBottom: PROGRESS_HEIGHT
  }),
  video: css({
    width: '100%',
    height: 'auto',
    transition: 'height 200ms',
    outline: 'none',
    '::-webkit-media-controls-panel': {
      display: 'none !important'
    },
    '::--webkit-media-controls-play-button': {
      display: 'none !important'
    },
    '::-webkit-media-controls-start-playback-button': {
      display: 'none !important'
    },
    ':focus': {
      outline: 'none'
    }
  }),
  videoFullscreen: css({
    width: '100%',
    height: 'auto',
    outline: 'none',
    transition: 'height 200ms',
    '::-webkit-media-controls-volume-slider': {
      display: 'none !important'
    },
    '::-webkit-media-controls-download-button': {
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
    height: PROGRESS_HEIGHT,
    transition: 'bottom 200ms'
  }),
  iconsLeft: css({
    position: 'absolute',
    zIndex: ZINDEX_VIDEOPLAYER_ICONS,
    left: 10,
    bottom: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    height: 24
  }),
  iconsRight: css({
    position: 'absolute',
    zIndex: ZINDEX_VIDEOPLAYER_ICONS,
    right: 10,
    bottom: 10,
    cursor: 'pointer'
  }),
  time: css({
    color: '#fff',
    padding: 6,
    ...sansSerifRegular18
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

class VideoPlayer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      playing: false,
      progress: 0,
      muted: globalState.muted,
      subtitles: props.subtitles || globalState.subtitles,
      loading: false,
      isFull: false
    }

    this.getCurrentTime = () => {
      if (this.pendingTime !== undefined) {
        return this.pendingTime
      }
      return this.video ? this.video.currentTime : 0
    }
    this.updateProgress = () => {
      const { video } = this
      if (!video) {
        return
      }
      const progress = this.getCurrentTime() / video.duration
      this.props.onProgress && this.props.onProgress(progress, video)
      this.context.saveMediaProgress &&
        this.context.saveMediaProgress(this.props, video)
      this.setState({ progress })
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
      if (!this.props.cinemagraph) {
        if (globalState.playingRef && globalState.playingRef !== this.video) {
          globalState.playingRef.pause()
        }
        globalState.playingRef = this.video
      }
      this.setState(() => ({
        playing: true,
        loading: false
      }))
      if (this.pendingTime !== undefined) {
        // ensure it starts playing at the right time
        // - iOS ignores currentTime calls before it initially started
        setTimeout(() => {
          if (Math.abs(this.video.currentTime - this.pendingTime) > 0.5) {
            this.video.currentTime = this.pendingTime
          }
          this.pendingTime = undefined
        }, 16)
      }
      this.syncProgress()
      this.props.onPlay && this.props.onPlay()
    }
    this.onPause = () => {
      this.setState(() => ({
        playing: false
      }))
      clearTimeout(this.readTimeout)
      this.props.onPause && this.props.onPause()
      this.pendingTime = undefined
    }
    this.onLoadStart = () => {
      this.setState(() => ({
        loading: true
      }))
    }
    this.setTime = (time = 0) => {
      clearTimeout(this.pendingTimeTimeout)
      this.pendingTime = time
      if (this.video) {
        if (!this.video.paused) {
          this.pendingTimeTimeout = setTimeout(() => {
            this.pendingTime = undefined
          }, 50)
        }
        this.video.currentTime = time
        this.updateProgress()
      }
    }
    this.isSeekable = new Promise(resolve => {
      this.onSeekable = resolve
    })
    this.onCanPlay = () => {
      this.setState(() => ({
        loading: false,
        startTimeSet: true
      }))
      this.onSeekable()
    }
    this.onLoadedMetaData = () => {
      this.setTextTracksMode()
      this.setState(() => ({
        loading: false
      }))
      this.onSeekable()
    }
    this.onVolumeChange = () => {
      if (
        !this.props.forceMuted &&
        !this.props.cinemagraph &&
        globalState.muted !== this.video.muted
      ) {
        this.setMuted(this.video.muted)
      }
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
        this.setTime(video.duration * progress)
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
    this.setInstanceState.setTime = time => {
      if (this.props.primary) {
        this.setTime(time)
        if (this.video && this.video.paused) {
          this.captureFocus()
          this.play()
        }
      }
    }
    this.handleKeyDown = event => {
      if (
        event.key === 'k' ||
        (!this.state.isFull && event.keyCode === 32) // 32: spacebar
      ) {
        event.preventDefault()
        event.stopPropagation()
        this.toggle()
      }
      if (
        (event.key === 'f' || event.key === 'F') &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        this.toggleFullscreen(event)
      }
    }
    this.toggleFullscreen = e => {
      e.preventDefault()
      e.stopPropagation()
      const { fullscreen, isFull } = this.state
      const fullWindow = this.props.fullWindow || !fullscreen
      if (fullWindow) {
        const { onFull } = this.props
        const shouldBeFull = !isFull
        this.setState({ isFull: shouldBeFull })
        onFull && onFull(shouldBeFull, false)
      } else {
        if (isFull) {
          fullscreen.exit()
        } else {
          fullscreen.request(this.video)
        }
      }
      this.captureFocus()
    }
    this.captureFocus = () => {
      this.video.focus()
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
    const playPromise = video && video.play()
    if (playPromise) {
      playPromise.catch(e => {
        warn('[VideoPlayer]', e.message)
      })
    }
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
  getStartTime() {
    if (this.props.primary) {
      const timeFromHash = parseTimeHash(window.location.hash)
      if (timeFromHash) {
        return Promise.resolve(timeFromHash)
      }
    }

    if (this.context.getMediaProgress) {
      return this.context.getMediaProgress(this.props).catch(() => {
        return undefined // ignore errors
      })
    }
    return Promise.resolve()
  }
  setMuted(muted) {
    const next = {
      muted
    }
    globalState.muted = next.muted
    globalState.instances.forEach(setter => {
      setter(next)
    })
  }
  componentDidMount() {
    this.setState({
      fullscreen: setupFullscreen({
        onChange: () => {
          const { onFull } = this.props
          const shouldBeFull = this.state.fullscreen.element() === this.video
          this.setState({ isFull: shouldBeFull })
          onFull && onFull(shouldBeFull, true)
        },
        video: this.video
      })
    })

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
    this.video.addEventListener('volumechange', this.onVolumeChange)

    this.setTextTracksMode()

    this.getStartTime().then(startTime => {
      if (startTime !== undefined) {
        this.setTime(startTime)
        this.isSeekable.then(() => {
          this.setTime(startTime)
        })
      }
    })
    if (this.video && !this.video.paused) {
      this.onPlay()
    }
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
    this.video.removeEventListener('canplay', this.onCanPlay)
    this.video.removeEventListener('canplaythrough', this.onCanPlay)
    this.video.removeEventListener('loadedmetadata', this.onLoadedMetaData)
    this.video.removeEventListener('volumechange', this.onVolumeChange)

    this.state.fullscreen && this.state.fullscreen.dispose()
  }
  render() {
    const {
      src,
      showPlay,
      size,
      forceMuted,
      autoPlay,
      loop,
      cinemagraph,
      attributes = {}
    } = this.props
    const {
      playing,
      progress,
      muted,
      subtitles,
      loading,
      fullscreen,
      isFull
    } = this.state

    const cinemagraphAttributes = cinemagraph
      ? {
          loop: true,
          muted: true,
          autoPlay: true,
          playsInline: true,
          'webkit-playsinline': ''
        }
      : {}

    const fullWindow = this.props.fullWindow || !fullscreen
    const enableRewind = this.getCurrentTime() > 0.1

    return (
      <div
        {...(fullWindow && isFull
          ? styles.fullWindow
          : merge(styles.wrapper, breakoutStyles[size]))}
        onClick={this.captureFocus}
      >
        <video
          {...(isFull ? styles.videoFullscreen : styles.video)}
          {...attributes}
          style={this.props.style}
          autoPlay={autoPlay}
          muted={forceMuted !== undefined ? forceMuted : muted}
          loop={loop}
          {...cinemagraphAttributes}
          ref={this.ref}
          controls={isFull && !fullWindow}
          controlsList={isFull ? 'nodownload' : undefined}
          onLoadedMetadata={this.onLoadedMetaData}
          crossOrigin='anonymous'
          poster={src.thumbnail}
          tabIndex='0'
          onKeyDown={this.handleKeyDown}
        >
          <source src={src.hls} type='application/x-mpegURL' />
          <source src={src.mp4} type='video/mp4' />
          {!!src.subtitles && (
            <track
              label='Deutsch'
              kind='subtitles'
              srcLang='de'
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
          <div {...styles.iconsLeft}>
            <div
              onClick={e => {
                e.stopPropagation()
                enableRewind && this.setTime(0)
              }}
            >
              <Rewind disabled={!enableRewind} />
            </div>
            <div {...styles.time}>
              {`${getFormattedTime(this.getCurrentTime())} / ${
                this.video ? getFormattedTime(this.video.duration) : '–:––'
              }`}
            </div>
          </div>
          <div {...styles.iconsRight}>
            {loading && <InlineSpinner size={25} />}{' '}
            {!!src.subtitles && (
              <span
                role='button'
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
            {forceMuted === undefined && !cinemagraph && (
              <span
                role='button'
                title={`Audio ${muted ? 'aus' : 'an'}`}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  this.setMuted(!muted)
                }}
              >
                <Volume off={muted} />
              </span>
            )}
            <span
              role='button'
              title='Vollbild'
              onClick={this.toggleFullscreen}
            >
              <Fullscreen off={!isFull} />
            </span>
          </div>
        </div>
        {!cinemagraph && (
          <Fragment>
            <div
              {...styles.progress}
              style={{
                width: `${progress * 100}%`,
                bottom: fullWindow && !playing ? 0 : undefined
              }}
            />
            <div
              {...styles.scrub}
              ref={this.scrubRef}
              onTouchStart={this.scrubStart}
              onTouchMove={this.scrub}
              onTouchEnd={this.scrubEnd}
              onMouseDown={this.scrubStart}
            />
          </Fragment>
        )}
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
        )
      }
    }
  }),
  size: PropTypes.oneOf(Object.keys(breakoutStyles)),
  showPlay: PropTypes.bool,
  loop: PropTypes.bool,
  // ignores global muted state and sets muted
  forceMuted: PropTypes.bool,
  cinemagraph: PropTypes.bool,
  // arbitrary attributes like playsinline, specific ones win
  attributes: PropTypes.object,
  // mandate full window instead of fullscreen API
  fullWindow: PropTypes.bool,
  onFull: PropTypes.func,
  // listen to url and global setTime
  primary: PropTypes.bool
}

VideoPlayer.contextTypes = {
  getMediaProgress: PropTypes.func,
  saveMediaProgress: PropTypes.func
}

VideoPlayer.defaultProps = {
  showPlay: true,
  size: undefined
}

export default VideoPlayer
