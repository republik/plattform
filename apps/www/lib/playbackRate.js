import createPersistedState from './hooks/use-persisted-state'

export const PLAYBACK_RATE_KEY = 'republik-plyaback-rate'
export const usePlaybackRate = createPersistedState(PLAYBACK_RATE_KEY)
