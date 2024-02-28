import { v4 } from 'uuid'
import {
  AudioPlayerEventMap,
  AudioPlayerEventTypes,
  IAudioPlayer,
  IAudioTrack,
} from './audio-player.interface'

function clamp(
  value: number,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
): number {
  return Math.min(max, Math.max(min, value))
}

export class WebAudioPlayer<T extends IAudioTrack = IAudioTrack>
  implements IAudioPlayer<T>
{
  private readonly _element: HTMLAudioElement
  private _track: T | null = null
  private _playbackRate = 1
  private readonly _listenersMap: Map<
    string,
    {
      type: AudioPlayerEventTypes
      // can be a generic type to allow for custom event types
      listener: (event: Event) => void
    }
  > = new Map()

  constructor(private readonly element: HTMLAudioElement) {
    console.debug('Initialize audio-player', element)
    this._element = element
  }

  // constructor() {
  //   this._element = new Audio()
  // }

  setupTrack(track: T, initialPosition = 0, startPlayback = false): void {
    console.debug('Setting up track', track)
    this._track = track
    this._element.autoplay = startPlayback
    this._element.src = track.src
    this._element.currentTime = initialPosition
    this._element.playbackRate = this._playbackRate

    if (startPlayback) {
      // Disable autoplay after the first play
      // This is to prevent the audio from playing automatically when the user seeks to a new position
      const handler = () => {
        setTimeout(() => {
          this.element.autoplay = false
        }, 200)
        this.element.removeEventListener('loadedmetadata', handler)
      }
      this.element.addEventListener('loadedmetadata', handler)
    }
  }
  getCurrentTrack(): T | null {
    return this._track
  }
  play(): void {
    if (!this._track) {
      return
    }
    console.debug('Playing track', this._track)
    this._element.play()
  }
  pause(): void {
    if (!this._track) {
      return
    }
    console.log('Pausing track', this._track)
    this._element.pause()
  }
  getCurrentPosition(): number {
    return this._element.currentTime
  }
  forwardPlayback(secs: number): void {
    console.debug('Forwarding playback by', secs, 'seconds')
    const newPosition = this._element.currentTime + secs
    this._element.currentTime = clamp(newPosition, 0, this._track?.duration)
  }
  rewindPlayback(secs: number): void {
    console.debug('Rewinding playback by', secs, 'seconds')
    const newPosition = this._element.currentTime - secs
    this._element.currentTime = clamp(newPosition, 0, this._track?.duration)
  }
  seekTo(secs: number): void {
    console.debug('Seeking to', secs, 'seconds')
    this._element.currentTime = clamp(secs, 0, this._track?.duration)
  }
  getPlaybackRate(): number {
    return this._element.playbackRate
  }
  setPlaybackRate(playbackRate: number): void {
    console.debug('Setting playback rate to', playbackRate)
    this._element.playbackRate = playbackRate
  }
  getAutoPlay(): boolean {
    return this._element.autoplay
  }
  setAutoPlay(autoPlay: boolean): void {
    console.debug('Setting autoplay to', autoPlay)
    this._element.autoplay = autoPlay
  }
  getError(): unknown {
    throw new Error('Method not implemented.')
  }
  reset(): void {
    this._element.pause()
    this._element.currentTime = 0
    this._element.src = ''
  }

  addEventListener<E extends keyof AudioPlayerEventMap>(
    eventType: E,
    listener: (event: AudioPlayerEventMap[E]) => void,
  ): string {
    const id = v4()
    let handler

    switch (eventType) {
      case 'updatePosition':
        handler = () =>
          listener({
            type: 'updatePosition',
            position: this._element.currentTime,
          } as AudioPlayerEventMap[E]) // Cast the event object to the expected type
        this._element.addEventListener('timeupdate', handler)
        break
      case 'loaded':
        handler = () =>
          listener({
            type: 'loaded',
            duration: this._element.duration,
          } as AudioPlayerEventMap[E]) // Cast the event object to the expected type
        this._element.addEventListener('loadedmetadata', handler)
        break

      case 'buffering':
        handler = listener({
          type: 'buffering',
          percent: this._element.buffered.length
            ? (this._element.buffered.end(this._element.buffered.length - 1) /
                this._element.duration) *
              100
            : 0,
        } as AudioPlayerEventMap[E]) // Cast the event object to the expected type
        this._element.addEventListener('progress', handler)
        break
      case 'error':
        handler = () =>
          listener({
            type: 'error',
            error: this._element.error,
          } as AudioPlayerEventMap[E]) // Cast the event object to the expected type
        this._element.addEventListener('error', handler)
        break
      case 'ended':
        handler = () =>
          listener({
            type: 'ended',
          } as AudioPlayerEventMap[E]) // Cast the event object to the expected type
        this._element.addEventListener('ended', handler)
        break
      default:
        throw new Error('Unknown event type')
    }
    this._listenersMap.set(id, { type: eventType, listener: handler })
    return id
  }

  removeEventListener(id: string): void {
    if (!this._listenersMap.has(id)) {
      return
    }
    const { listener, type } = this._listenersMap.get(id)
    switch (type) {
      case 'updatePosition':
        this._element.removeEventListener('timeupdate', listener)
        break
      case 'loaded':
        this._element.removeEventListener('loadedmetadata', listener)
        break
      case 'buffering':
        this._element.removeEventListener('progress', listener)
        break
      case 'error':
        this._element.removeEventListener('error', listener)
        break
      case 'ended':
        this._element.removeEventListener('ended', listener)
        break
    }
  }
}
