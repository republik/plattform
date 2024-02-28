/* eslint-disable no-unused-vars */
export interface IAudioTrack {
  // unique identifier for the track
  id: string
  // duration of the track in seconds
  duration?: number
  // URL of the audio file
  src: string
  // initial position to start playing the track
  initialPosition?: number
}

export interface AudioPlayerEventMap {
  updatePosition: {
    type: 'updatePosition'
    position: number
  }
  loaded: {
    type: 'loaded'
    duration: number
  }
  buffering: {
    type: 'buffering'
    percent: number
  }
  error: { type: 'error'; error: unknown }
  ended: { type: 'ended' }
}

export type AudioPlayerEventTypes = keyof AudioPlayerEventMap

export interface IAudioPlayer<
  T extends IAudioTrack = IAudioTrack,
  E = unknown,
> {
  /**
   * Prepare playing a track
   * @param track
   * @param initialPosition
   * @param startPlayback
   */
  setupTrack(track: T, initialPosition?: number, startPlayback?: boolean): void
  getCurrentTrack(): T | null

  /**
   * Start playing the 'currentTrack' that has been loaded via `setupTrack`
   */
  play(): void
  pause(): void

  getCurrentPosition(): number
  forwardPlayback(secs: number): void
  rewindPlayback(secs: number): void
  seekTo(secs: number): void

  getPlaybackRate(): number
  setPlaybackRate(playbackRate: number): void

  getAutoPlay(): boolean
  setAutoPlay(autoPlay: boolean): void

  getError(): E
  // reset the player to allow recovering from errors
  reset(): void

  addEventListener<E extends keyof AudioPlayerEventMap>(
    eventType: E,
    handler: (event: AudioPlayerEventMap[E]) => void,
  ): string

  removeEventListener(id: string): void
}
