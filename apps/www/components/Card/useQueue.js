import { useEffect } from 'react'

import createPersistedState from '../../lib/hooks/use-persisted-state'

const useQueueState = createPersistedState('republik-card-group-queue')

export const useQueue = ({ me, subToUser, unsubFromUser }) => {
  const [queue, setQueue] = useQueueState({ statePerUserId: {}, pending: [] })
  const addToQueue = (userId, sub) =>
    setQueue((queue) => {
      if (!sub && !queue.statePerUserId[userId]) {
        // only rm pending subs
        return {
          ...queue,
          pending: queue.pending.filter((item) => item.userId !== userId),
        }
      }
      return {
        ...queue,
        pending: queue.pending
          .filter((item) => item.userId !== userId)
          .concat({ sub, userId: userId }),
      }
    })
  const replaceStatePerUserId = (statePerUserId) => {
    setQueue((queue) => ({
      ...queue,
      statePerUserId: {
        ...statePerUserId,
        ...Object.keys(queue.statePerUserId).reduce((wipState, key) => {
          if (queue.statePerUserId[key].wip > Date.now() - 1000 * 31) {
            wipState[key] = queue.statePerUserId[key]
          }
          return wipState
        }, {}),
      },
    }))
  }
  const clearPending = () => {
    setQueue((queue) => ({
      ...queue,
      pending: [],
    }))
  }

  useEffect(() => {
    if (me && queue && queue.pending && queue.pending.length) {
      const timeout = setTimeout(() => {
        setQueue((queue) => {
          const item = queue.pending[0]
          if (!item) {
            return queue
          }
          const { userId } = item
          const currentState = queue.statePerUserId[userId]
          const now = Date.now()
          if (
            currentState &&
            currentState.wip &&
            now - currentState.wip < 1000 * 31
          ) {
            return { ...queue }
          }
          const clearOwn = () => {
            setQueue((queue) => {
              const statePerUserId = { ...queue.statePerUserId }
              if (
                statePerUserId[userId] &&
                now === statePerUserId[userId].wip
              ) {
                delete statePerUserId[userId]
              }
              return {
                ...queue,
                statePerUserId,
              }
            })
          }

          if (item.sub) {
            subToUser({ userId })
              .then(({ data: { subscribe: sub } }) => {
                setQueue((queue) => ({
                  ...queue,
                  statePerUserId: {
                    ...queue.statePerUserId,
                    [userId]: { id: sub.id },
                  },
                }))
              })
              .catch(() => {
                // no retries for now
                clearOwn()
              })
            return {
              ...queue,
              statePerUserId: {
                ...queue.statePerUserId,
                [userId]: {
                  ...currentState,
                  wip: now,
                },
              },
              pending: queue.pending.slice(1),
            }
          } else {
            if (currentState && currentState.id) {
              unsubFromUser({ subscriptionId: currentState.id })
                .then(() => clearOwn())
                .catch(() => {
                  clearOwn()
                })
              return {
                ...queue,
                statePerUserId: {
                  ...queue.statePerUserId,
                  [userId]: {
                    ...currentState,
                    wip: now,
                  },
                },
                pending: queue.pending.slice(1),
              }
            }
            // never subscribed in this browser
            return {
              ...queue,
              statePerUserId: {
                ...queue.statePerUserId,
                [userId]: undefined,
              },
              pending: queue.pending.slice(1),
            }
          }
        })
      }, 500 + Math.random() * 1000)

      return () => clearTimeout(timeout)
    }
  }, [queue, me])

  return [queue, addToQueue, clearPending, replaceStatePerUserId]
}
