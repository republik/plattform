import createPersistedState from './hooks/use-persisted-state'

export const PLAYBACK_RATE_KEY = 'republik-playback-rate'
export const usePlaybackRate = createPersistedState(PLAYBACK_RATE_KEY)

// MIGRATION ADDED ON 01.04.2022
// - can be removed after 7 days
if (typeof window !== undefined) {
  try {
    const oldKey = 'republik-plyaback-rate'
    const oldItem = window.localStorage.getItem(oldKey)
    if (oldItem) {
      window.localStorage.setItem(PLAYBACK_RATE_KEY, oldItem)
      window.localStorage.removeItem(oldKey)
    }
  } catch (e) {}
}
