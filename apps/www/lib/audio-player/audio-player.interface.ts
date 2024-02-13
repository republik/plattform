export interface IAudioTrack {
  // unique identifier for the track
  id: string
  // duration of the track in seconds
  duration?: number
  // URL of the audio file
  src: string
}

export interface IAudioPlayer<
  T extends IAudioTrack = IAudioTrack,
  E = unknown,
> {
  /**
   * Prepare playing a track
   * @param track
   */
  setupTrack(track: T): void
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

  getError(): E
  // reset the player to allow recovering from errors
  reset(): void

  // TODO: observer for events
}
