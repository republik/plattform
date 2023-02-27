import { css } from 'glamor'
import Link from 'next/link'
import { useMemo } from 'react'

import {
  Editorial,
  useColorContext,
  plainButtonRule,
  fontStyles,
  convertStyleToRem,
  mediaQueries,
  NotificationIcon,
  NotificationsNoneIcon,
} from '@project-r/styleguide'

import { intersperse } from '../../../lib/utils/helpers'
import { useTranslation } from '../../../lib/withT'
import EventObjectType from '../graphql/EventObjectType'

import useDocumentSubscriptionQuery from '../graphql/useDocumentSubscriptionQuery'
import useSubscribeDocumentMutation from '../graphql/useSubscribeDocumentMutation'
import useUnsubscribeDocumentMutation from '../graphql/useUnsubscribeDocumentMutation'

const styles = {
  audioInfo: css({
    textAlign: 'left',
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.sansSerifRegular15),
    },
  }),
}

const Contributors = ({ contributors }) => {
  const { t } = useTranslation()

  const names = intersperse(
    contributors.map((s) =>
      s.user?.slug ? (
        <Link href={`/~${s.user.slug}`} passHref>
          <Editorial.A>{s?.user?.name || s.name}</Editorial.A>
        </Link>
      ) : (
        s.name
      ),
    ),
    (_, i) => <span key={i}>, </span>,
  )

  return t.pluralize.elements('article/actionbar/audio/info/voices', {
    names,
    count: contributors.length,
  })
}

const PlaySyntheticReadAloud = ({ onPlay }) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  return (
    <span {...colorScheme.set('color', 'textSoft')}>
      <button
        {...plainButtonRule}
        style={{ textDecoration: 'underline', display: 'inline' }}
        onClick={onPlay}
      >
        {t('article/actionbar/audio/info/play-synth')}
      </button>
    </span>
  )
}

const ReadAloudSoonHint = () => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  return (
    <span {...colorScheme.set('color', 'textSoft')}>
      {t('article/actionbar/audio/info/read-soon')}
    </span>
  )
}

const SubscribeReadAloud = ({ document }) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  const { data, loading } = useDocumentSubscriptionQuery({
    variables: {
      path: document.meta?.path,
      onlyMe: true,
    },
    skip: !document.meta?.path,
  })

  const [subscribe] = useSubscribeDocumentMutation()
  const [unsubscribe] = useUnsubscribeDocumentMutation()

  const readAloudSubscription = data?.document?.subscriptions?.nodes.find(
    ({ object: { id } }) => id === document.id,
  )

  const isSubscribed =
    readAloudSubscription?.filters.includes(EventObjectType.READ_ALOUD) &&
    readAloudSubscription?.active &&
    readAloudSubscription?.isEligibleForNotifications

  const handleMutation = useMemo(
    () => async () => {
      try {
        if (isSubscribed) {
          await unsubscribe({
            variables: {
              subscriptionId: readAloudSubscription.id,
              filters: [EventObjectType.READ_ALOUD],
            },
          })
        } else {
          await subscribe({
            variables: {
              documentId: document.id,
            },
          })
        }
      } catch (e) {
        console.error(e)
      }
    },
    [readAloudSubscription],
  )

  if (!readAloudSubscription?.isEligibleForNotifications) {
    return null
  }

  return (
    <span {...colorScheme.set('color', 'textSoft')}>
      <button
        {...plainButtonRule}
        style={{ textDecoration: 'underline', display: 'inline' }}
        onClick={handleMutation}
        disabled={!!loading}
      >
        {isSubscribed ? (
          <NotificationIcon size={24} />
        ) : (
          <NotificationsNoneIcon size={24} />
        )}
        {isSubscribed ? 'Nicht benachrichten' : 'Benachrichtigen'}
      </button>
    </span>
  )
}

const Info = ({ document, handlePlay }) => {
  const { kind, mp3, contributorsVoice, willBeReadAloud } = useMemo(() => {
    const kind = document.meta?.audioSource?.kind
    const mp3 = document.meta?.audioSource?.mp3
    const contributorsVoice =
      document.meta?.contributors?.filter((c) => c.kind === 'voice') || []
    const willBeReadAloud = document.meta?.willBeReadAloud

    return { kind, mp3, contributorsVoice, willBeReadAloud }
  }, [document.id])

  return (
    <span {...styles.audioInfo}>
      {intersperse(
        [
          kind === 'readAloud' && !!mp3 && (
            <Contributors contributors={contributorsVoice} />
          ),
          kind === 'syntheticReadAloud' && !!mp3 && (
            <PlaySyntheticReadAloud onPlay={handlePlay} />
          ),
          (kind !== 'readAloud' || !mp3) && !!willBeReadAloud && (
            <>
              <ReadAloudSoonHint />
              <SubscribeReadAloud document={document} />
            </>
          ),
        ].filter(Boolean),
        (_, i) => (
          <span key={i}>. </span>
        ),
      )}
    </span>
  )
}

export default Info
