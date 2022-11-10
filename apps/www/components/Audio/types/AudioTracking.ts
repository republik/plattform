/**
 * All player action locations to track
 */
export enum AudioPlaybackLocation {
  PLAYER = 'AudioPlayer',
  FRONT = 'Front',
  MARKETING_FRONT = 'MarketingFront',
  ACTION_BAR = 'ActionBar',
  ARTICLE = 'Article',
}

/**
 * All AudioPlayer actions to track
 */
export enum AudioPlayerActions {
  PLAY_TRACK = 'playTrack',
  PLAY_SYNTHETIC = 'playSynthetic',
  ADD_QUEUE_ITEM = 'addQueueItem',
  REMOVE_QUEUE_ITEM = 'removeQueueItem',
  ADD_QUEUE_HEAD_ITEM = 'addQueueHeadItem',
  ADD_NEXT_QUEUE_ITEM = 'addQueueNextItem',
  QUEUE_ADVANCE = 'queueAdvance',
  QUEUE_ENDED = 'queueEnded',
  SKIP_TO_NEXT = 'trackSkipped',
  PLAYBACK_RATE_CHANGED = 'playbackRateChanged',
  ERROR = 'error',
  ILLEGAL_PROGRESS_UPDATE = 'illegalProgressUpdate',
}
