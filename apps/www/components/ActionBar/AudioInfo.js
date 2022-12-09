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
  Checkbox,
} from '@project-r/styleguide'
import Link from 'next/link'
import { intersperse } from '../../lib/utils/helpers'
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
  const { data, loading, refetch } = useDocumentSubscriptionQuery({
    variables: {
      path: documentPath,
      onlyMe: true,
    },
  })
  const [subscribe] = useSubscribeDocumentMutation()
  const [unsubscribe] = useUnsubscribeDocumentMutation()

  const subscriptions = data?.document?.subscriptions
  const readAloudSubscription = subscriptions?.nodes.find(
    (s) =>
      s?.object.id === documentId &&
      s.active &&
      s.filters.some((f) => f === EventObjectType.READ_ALOUD),
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
        <>
          <button
            {...plainButtonRule}
            style={{ textDecoration: 'underline' }}
            onClick={() => play()}
          >
            {t('article/actionbar/audio/info/play-synth')}
          </button>
          {!!willBeReadAloud && (
            <>
              {'. '}
              <span>{t('article/actionbar/audio/info/read-soon')}</span>
              {(!!data || !loading) && (
                <Checkbox
                  checked={!!readAloudSubscription}
                  onChange={(_, checked) => {
                    if (checked) {
                      subscribe({
                        variables: {
                          documentId,
                          filters: [EventObjectType.READ_ALOUD],
                        },
                      })
                    } else {
                      unsubscribe({
                        variables: {
                          subscriptionId: readAloudSubscription?.id,
                          filters: [EventObjectType.READ_ALOUD],
                        },
                      }).then(() => refetch())
                    }
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </span>
  )
}

export default compose(withT)(AudioInfo)
