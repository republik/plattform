export enum AudioEvent {
  PLAY = 'audio:play',
  PAUSE = 'audio:pause',
  STOP = 'audio:stop',
  SEEK = 'audio:seek',
  FORWARD = 'audio:forward',
  BACKWARD = 'audio:backward',
  SYNC = 'audio:sync',
  PLAYBACK_RATE = 'audio:playbackRate',
  QUEUE_UPDATE = 'audio:queueUpdate',
  QUEUE_ADVANCE = 'audio:queueAdvance',
  ERROR = 'audio:error',
}

// Object with callbacks to control the web audio player
export type AudioEventHandlers = {
  handlePlay: () => Promise<void>
  handlePause: () => Promise<void>
  handleStop: () => Promise<void>
  handleSeekTo: (newPosition: number) => Promise<void>
  handleForward: (forwardTime: number) => Promise<void>
  handleBackward: (backwardTime: number) => Promise<void>
  handlePlaybackRateChange: (newPlaybackRate: number) => Promise<void>
}
