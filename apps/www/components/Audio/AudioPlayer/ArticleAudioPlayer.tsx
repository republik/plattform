import {
  Editorial,
  IconButton,
  convertStyleToRem,
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import {
  IconNotificationsActive,
  IconNotificationsNone,
  IconPauseCircleOutline,
  IconPlayCircleOutline,
  IconPlaylistAdd,
  IconPlaylistRemove,
} from '@republik/icons'
import { css } from 'glamor'
import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useMe } from '../../../lib/context/MeContext'
import EventObjectType from '../../../lib/graphql-types/EventObjectType'
import { intersperse } from '../../../lib/utils/helpers'
import { useTranslation } from '../../../lib/withT'
import {
  useSubscribeDocumentMutation,
  useUnsubscribeDocumentMutation,
} from '../../Notifications/graphql-hooks'
import { useAudioContext } from '../AudioProvider'
import { useMediaProgress } from '../MediaProgress'
import { useGlobalAudioState } from '../globalAudioState'
import useAudioQueue from '../hooks/useAudioQueue'
import { AudioPlayerLocations } from '../types/AudioActionTracking'
import { AudioPlayerItem } from '../types/AudioPlayerItem'
import { AUDIO_PLAYER_WRAPPER_ID } from './constants'
import Time from './ui/Time'

const styles = {
  container: css({
    padding: 12,
    background: '#eee',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'stretch',
    gap: 12,
  }),
  labels: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flexGrow: '1',
    minHeight: 'calc(8px + 3.7rem)',
    justifyContent: 'center',
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.sansSerifRegular15),
    },
  }),
  audioInfo: css({
    margin: 0,
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    whiteSpace: 'pre-wrap',
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.sansSerifRegular15),
    },
  }),
}

// FIXME: totally manually inferred from gql schema. This should be automated!
type PlayerProps = {
  document: {
    id: string
    subscribedBy: any
    meta?: {
      contributors: { name: string; kind?: string; user: any }[]
      willBeReadAloud?: boolean
    } & AudioPlayerItem['meta']
  }
}

type PlayerKind = 'readAloud' | 'syntheticReadAloud' | 'other'

export const ArticleAudioPlayer = ({ document }: PlayerProps) => {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    addAudioQueueItem,
    removeAudioQueueItem,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  const { currentTime } = useGlobalAudioState()
  const { audioQueue, checkIfInQueue } = useAudioQueue()
  const { hasAccess } = useMe()

  const isActiveAudioItem = checkIfActivePlayerItem(document.id)
  const itemPlaying = isPlaying && isActiveAudioItem
  const itemInAudioQueue = checkIfInQueue(document.id)
  const { getMediaProgress } = useMediaProgress()

  const [mediaProgress, setMediaProgress] = useState(0)

  const currentDisplayTime =
    isActiveAudioItem && currentTime > 0 ? currentTime : mediaProgress
  const duration = document.meta.audioSource.durationMs / 1000

  const playerKind: PlayerKind = document?.meta?.audioSource?.kind ?? 'other'

  const readAloudSubscription = document?.subscribedBy?.nodes.find(
    ({ isEligibleForNotifications, object: { id } }) =>
      isEligibleForNotifications && id === document.id,
  )

  const showReadAloudSubscribe =
    document.meta?.willBeReadAloud &&
    readAloudSubscription &&
    playerKind === 'syntheticReadAloud'
      ? true
      : false

  useEffect(() => {
    const updateMediaProgress = async () => {
      const mp = await getMediaProgress({
        mediaId: document.meta.audioSource.mediaId,
        durationMs: document.meta.audioSource.durationMs,
      })
      setMediaProgress(mp || 0)
    }

    if (currentTime === 0) {
      updateMediaProgress()
    }
  }, [document.meta.audioSource.mediaId, currentTime])

  const play = () => {
    toggleAudioPlayer(document, AudioPlayerLocations.ACTION_BAR)
  }

  return (
    <div {...styles.container} {...colorScheme.set('background', 'hover')}>
      <IconButton
        aria-controls={AUDIO_PLAYER_WRAPPER_ID}
        Icon={itemPlaying ? IconPauseCircleOutline : IconPlayCircleOutline}
        size={48}
        title={t(`styleguide/AudioPlayer/${isPlaying ? 'pause' : 'play'}`)}
        onClick={() => {
          if (isActiveAudioItem) {
            toggleAudioPlayback()
          } else {
            play()
          }
        }}
        style={{ marginRight: 0 }}
      />
      <div {...styles.labels}>
        <div>
          {playerKind === 'readAloud' ? (
            <Contributors
              contributors={
                document.meta?.contributors?.filter(
                  (c) => c.kind === 'voice',
                ) || []
              }
            />
          ) : playerKind === 'syntheticReadAloud' ? (
            t('article/actionbar/audio/info/synthetic')
          ) : (
            document.meta?.title
          )}
        </div>
        <Time currentTime={currentDisplayTime} duration={duration} />
        {showReadAloudSubscribe && (
          <SubscribeReadAloud subscription={readAloudSubscription} />
        )}
      </div>

      {hasAccess && (
        <IconButton
          Icon={itemInAudioQueue ? IconPlaylistRemove : IconPlaylistAdd}
          title={
            itemInAudioQueue
              ? t('AudioPlayer/Queue/Remove')
              : t('AudioPlayer/Queue/Add')
          }
          disabled={itemInAudioQueue}
          onClick={async (e) => {
            e.preventDefault()
            if (itemInAudioQueue) {
              await removeAudioQueueItem(itemInAudioQueue.id)
              //  trackEvent([
              //       AudioPlayerLocations.ACTION_BAR,
              //       AudioPlayerActions.REMOVE_QUEUE_ITEM,
              //       meta?.path,
              //     ])
            } else {
              await addAudioQueueItem(document)
              // trackEvent([
              //   AudioPlayerLocations.ACTION_BAR,
              //   AudioPlayerActions.ADD_QUEUE_ITEM,
              //   meta?.path,
              // ])
            }
          }}
          style={{ marginRight: 0 }}
        />
      )}
    </div>
  )
}

const Contributors = ({ contributors }) => {
  const { t } = useTranslation()

  const names = intersperse(
    contributors.map((s) => (
      <Fragment key={s.user?.slug ?? s.name}>
        {s.user?.slug ? (
          <Link href={`/~${s.user.slug}`} passHref>
            <Editorial.A>{s?.user?.name || s.name}</Editorial.A>
          </Link>
        ) : (
          s.name
        )}
      </Fragment>
    )),
    (_, i) => <span key={i}>, </span>,
  )

  return t.pluralize.elements('article/actionbar/audio/info/voices', {
    names,
    count: contributors.length,
  })
}

const subscribeStyles = {
  input: css({
    cursor: 'pointer',
    // hidden but accessible
    // https://www.sarasoueidan.com/blog/inclusively-hiding-and-styling-checkboxes-and-radio-buttons/
    position: 'absolute',
    top: 3,
    left: 0,
    width: 18,
    height: 18,
    opacity: 0,
  }),
  label: css({
    cursor: 'pointer',
    position: 'relative',
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    // [mediaQueries.mUp]: {
    //   ...convertStyleToRem(fontStyles.sansSerifRegular15),
    // },
    // verticalAlign: 'middle',
    '&:hover': {
      color: 'primary',
    },
  }),
}
const SubscribeReadAloud = ({ subscription }) => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()

  const linkStyleRule = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor('textSoft'),
        fill: colorScheme.getCSSColor('textSoft'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('text'),
            fill: colorScheme.getCSSColor('text'),
          },
        },
      }),
    [colorScheme],
  )

  const [subscribe, { loading: loadingSubscribe }] =
    useSubscribeDocumentMutation()
  const [unsubscribe, { loading: loadingUnsubscribe }] =
    useUnsubscribeDocumentMutation()

  const loading = loadingSubscribe || loadingUnsubscribe

  const isSubscribed =
    subscription.filters.includes(EventObjectType.READ_ALOUD) &&
    subscription.active

  const handleMutation = useMemo(
    () => async () => {
      try {
        if (isSubscribed) {
          await unsubscribe({
            variables: {
              subscriptionId: subscription.id,
              filters: [EventObjectType.READ_ALOUD],
            },
          })
        } else {
          await subscribe({
            variables: {
              documentId: subscription.object.id,
              filters: [EventObjectType.READ_ALOUD],
            },
          })
        }
      } catch (e) {
        console.error(e)
      }
    },
    [subscription],
  )

  if (!subscription?.isEligibleForNotifications) {
    return null
  }

  return (
    <label
      {...css({
        display: 'inline-block',
        width: 'max-content',
      })}
      {...subscribeStyles.label}
      {...linkStyleRule}
    >
      <input
        {...subscribeStyles.input}
        type='checkbox'
        checked={isSubscribed}
        onChange={() => handleMutation()}
        disabled={loading}
      ></input>
      {t('article/actionbar/audio/info/readAloud/subscribe')}
      <span style={{ marginLeft: 4 }}>
        {isSubscribed ? (
          <IconNotificationsActive size={18} />
        ) : (
          <IconNotificationsNone size={18} />
        )}
      </span>
    </label>
  )
}