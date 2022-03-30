import { createContext, useContext } from 'react';
import compose from 'lodash/flowRight'
import { graphql, withApollo } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

import withMe from '../../lib/apollo/withMe'
import createPersistedState from '../../lib/hooks/use-persisted-state'

const MediaProgressContext = createContext()

export const useMediaProgress = () => useContext(MediaProgressContext)

const mediaProgressQuery = gql`
  query mediaProgress($mediaId: ID!) {
    mediaProgress(mediaId: $mediaId) {
      id
      mediaId
      secs
    }
  }
`

const upsertMediaProgressMutation = gql`
  mutation upsertMediaProgress($mediaId: ID!, $secs: Float!) {
    upsertMediaProgress(mediaId: $mediaId, secs: $secs) {
      id
      mediaId
      secs
    }
  }
`

const useLocalMediaProgressState = createPersistedState(
  'republik-progress-media',
)

const MediaProgressProvider = ({
  children,
  me,
  client,
  upsertMediaProgress,
}) => {
  const isTrackingAllowed = me && me.progressConsent === true
  const [localMediaProgress, setLocalMediaProgress] =
    useLocalMediaProgressState()

  const saveMediaProgressNotPlaying = debounce((mediaId, currentTime) => {
    // Fires on pause, on scrub, on end of video.
    if (isTrackingAllowed) {
      upsertMediaProgress(mediaId, currentTime)
    } else {
      setLocalMediaProgress({ mediaId, currentTime })
    }
  }, 300)

  const saveMediaProgressWhilePlaying = throttle(
    (mediaId, currentTime) => {
      // Fires every 5 seconds while playing.
      if (isTrackingAllowed) {
        upsertMediaProgress(mediaId, currentTime)
      } else {
        setLocalMediaProgress({ mediaId, currentTime })
      }
    },
    5000,
    { trailing: true },
  )

  const saveMediaProgress = ({ mediaId }, mediaElement) => {
    if (!mediaId) {
      return
    }
    saveMediaProgressNotPlaying(mediaId, mediaElement.currentTime)
    saveMediaProgressWhilePlaying(mediaId, mediaElement.currentTime)
  }

  const getMediaProgress = ({ mediaId, durationMs } = {}) => {
    if (!mediaId) {
      return Promise.resolve()
    }
    if (isTrackingAllowed) {
      return client
        .query({
          query: mediaProgressQuery,
          variables: { mediaId },
          fetchPolicy: 'network-only',
        })
        .then(({ data: { mediaProgress } }) => {
          // mediaProgress can be null
          const { secs } = mediaProgress || {}
          if (secs) {
            if (
              durationMs &&
              Math.round(secs) === Math.round(durationMs / 1000)
            ) {
              return
            }
            return secs - 2
          }
        })
    } else if (localMediaProgress && localMediaProgress.mediaId === mediaId) {
      return Promise.resolve(localMediaProgress.currentTime - 2)
    }
    return Promise.resolve()
  }

  return (
    <MediaProgressContext.Provider
      value={{
        getMediaProgress,
        saveMediaProgress,
      }}
    >
      {children}
    </MediaProgressContext.Provider>
  )
}

const ComposedMediaProgressProvider = compose(
  withApollo,
  withMe,
  graphql(upsertMediaProgressMutation, {
    props: ({ mutate }) => ({
      upsertMediaProgress: (mediaId, secs) =>
        mutate({
          variables: {
            mediaId,
            secs,
          },
        }),
    }),
  }),
)(MediaProgressProvider)

export default ComposedMediaProgressProvider
