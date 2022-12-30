import { css } from 'glamor'
import compose from 'lodash/flowRight'

import withT from '../../lib/withT'

import {
  convertStyleToRem,
  fontStyles,
  mediaQueries,
  plainButtonRule,
  Editorial,
  useColorContext,
  NotificationIcon,
  NotificationsNoneIcon,
} from '@project-r/styleguide'
import Link from 'next/link'

import { intersperse } from '../../lib/utils/helpers'
import { useMemo } from 'react'
import useDocumentSubscriptionQuery from './graphql/useDocumentSubscriptionQuery'
import useSubscribeDocumentMutation from './graphql/useSubscribeDocumentMutation'
import useUnsubscribeDocumentMutation from './graphql/useUnsubscribeDocumentMutation'
import EventObjectType from './graphql/EventObjectType'

const styles = {
  audioInfo: css({
    textAlign: 'left',
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.sansSerifRegular15),
    },
  }),
  buttonWrapper: css({}),
}

const AudioInfo = ({
  t,
  showAudioButtons,
  play,
  speakers = [],
  willBeReadAloud,
  documentId,
  documentPath,
}) => {
  const [colorScheme] = useColorContext()
  const { data, loading } = useDocumentSubscriptionQuery({
    variables: {
      path: documentPath,
      onlyMe: true,
    },
    skip: !willBeReadAloud,
  })
  const [subscribe] = useSubscribeDocumentMutation()
  const [unsubscribe] = useUnsubscribeDocumentMutation()

  const readAloudSubscription = data?.document?.subscriptions?.nodes.find(
    ({ object: { id } }) => id === documentId,
  )
  const isSubscribedToReadAloud = readAloudSubscription?.filters.includes(
    EventObjectType.READ_ALOUD,
  )

  const handleClick = useMemo(
    () => async () => {
      try {
        if (isSubscribedToReadAloud) {
          await unsubscribe({
            variables: {
              subscriptionId: readAloudSubscription.id,
              filters: [EventObjectType.READ_ALOUD],
            },
          })
        } else {
          await subscribe({
            variables: {
              documentId,
            },
          })
        }
      } catch (e) {
        console.error(e)
      }
    },
    [
      subscribe,
      unsubscribe,
      isSubscribedToReadAloud,
      readAloudSubscription,
      documentId,
    ],
  )

  return (
    <span
      {...styles.audioInfo}
      {...colorScheme.set('color', showAudioButtons ? 'text' : 'textSoft')}
    >
      {showAudioButtons ? (
        <>
          {t('article/actionbar/audio/info/speaker') + ' '}
          {speakers?.length
            ? intersperse(
                speakers.map((s) =>
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
            : t('article/actionbar/audio/info/speaker/default')}
        </>
      ) : (
        <span {...styles.buttonWrapper}>
          <button
            {...plainButtonRule}
            style={{ textDecoration: 'underline', display: 'inline' }}
            onClick={() => play()}
          >
            {t('article/actionbar/audio/info/play-synth')}
          </button>
          {!!willBeReadAloud && (
            <>
              {'. '}
              <span style={{ marginRight: '0.25rem' }}>
                {t('article/actionbar/audio/info/read-soon')}
              </span>

              {(!!data || !loading) && readAloudSubscription && (
                <button
                  onClick={handleClick}
                  {...plainButtonRule}
                  style={{ display: 'inline-block' }}
                >
                  {isSubscribedToReadAloud ? (
                    <NotificationIcon size={24} />
                  ) : (
                    <NotificationsNoneIcon size={24} />
                  )}
                  {!isSubscribedToReadAloud && (
                    <span style={{ textDecoration: 'underline' }}>
                      {t(
                        'article/actionbar/audio/info/read-aloud-notification',
                      )}
                    </span>
                  )}
                </button>
              )}
            </>
          )}
        </span>
      )}
    </span>
  )
}

export default compose(withT)(AudioInfo)
