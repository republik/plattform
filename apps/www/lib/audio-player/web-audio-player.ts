import { IAudioPlayer, IAudioTrack } from './audio-player.interface'

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

  constructor(private readonly element: HTMLAudioElement) {
    console.debug('Initialize audio-player', element)
    this._element = element
  }

  // constructor() {
  //   this._element = new Audio()
  // }

  setupTrack(track: T): void {
    console.debug('Setting up track', track)
    this._track = track
    this._element.src = track.src
    // this._element.load();
    this._element.currentTime = 0
    this._element.playbackRate = this._playbackRate
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
  getError(): unknown {
    throw new Error('Method not implemented.')
  }
  reset(): void {
    this._element.pause()
    this._element.currentTime = 0
    this._element.src = ''
  }
}
