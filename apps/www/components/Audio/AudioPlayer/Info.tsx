import { css } from 'glamor'
import Link from 'next/link'
import { Fragment, useMemo } from 'react'

import {
  Editorial,
  useColorContext,
  plainButtonRule,
  fontStyles,
  convertStyleToRem,
  mediaQueries,
  Checkbox,
  CalloutMenu,
} from '@project-r/styleguide'

import { intersperse } from '../../../lib/utils/helpers'
import { useTranslation } from '../../../lib/withT'
import EventObjectType from '../../../lib/graphql-types/EventObjectType'
import {
  useSubscribeDocumentMutation,
  useUnsubscribeDocumentMutation,
} from '../../Notifications/graphql-hooks'

const styles = {
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

const SubscribeReadAloud = ({ subscription }) => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()

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
    <div
      {...css({
        display: 'block',
        width: 'max-content',
      })}
    >
      <Checkbox
        checked={isSubscribed}
        onChange={() => handleMutation()}
        disabled={loading}
      >
        <span {...colorScheme.set('color', 'text')}>
          {t('article/actionbar/audio/info/readAloud/checkbox')}
        </span>
      </Checkbox>
    </div>
  )
}

const Info = ({ document, handlePlay }) => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
  const {
    kind,
    mp3,
    contributorsVoice,
    willBeReadAloud,
    readAloudSubscription,
  } = useMemo(() => {
    const kind = document.meta?.audioSource?.kind
    const mp3 = document.meta?.audioSource?.mp3
    const contributorsVoice =
      document.meta?.contributors?.filter((c) => c.kind === 'voice') || []
    const willBeReadAloud = document.meta?.willBeReadAloud
    const readAloudSubscription = document?.subscribedBy?.nodes.find(
      ({ isEligibleForNotifications, object: { id } }) =>
        isEligibleForNotifications && id === document.id,
    )

    return {
      kind,
      mp3,
      contributorsVoice,
      willBeReadAloud,
      readAloudSubscription,
    }
  }, [document.id, document.subscribedBy])

  return (
    <p {...styles.audioInfo}>
      {intersperse(
        [
          kind === 'readAloud' && !!mp3 && (
            <Contributors contributors={contributorsVoice} key='contributors' />
          ),
          kind === 'syntheticReadAloud' &&
            !!mp3 &&
            (!willBeReadAloud || !readAloudSubscription) &&
            t('article/actionbar/audio/info/synthetic'),
          (kind !== 'readAloud' || !mp3) &&
            !!willBeReadAloud &&
            readAloudSubscription && (
              <span {...colorScheme.set('color', 'textSoft')} key='subscribe'>
                {t.elements('article/actionbar/audio/info/readAloud', {
                  subscribe: (
                    <CalloutMenu
                      key='subscribe'
                      inline
                      Element={(props) => (
                        <button
                          {...plainButtonRule}
                          style={{
                            display: 'inline-block !important',
                            textDecoration: 'underline',
                          }}
                          {...props}
                        >
                          {t(
                            'article/actionbar/audio/info/readAloud/subscribe',
                          )}
                        </button>
                      )}
                    >
                      <SubscribeReadAloud
                        subscription={readAloudSubscription}
                      />
                    </CalloutMenu>
                  ),
                  synthetic:
                    kind === 'syntheticReadAloud' && !!mp3 ? (
                      <span key='synthetic'>
                        {t('article/actionbar/audio/info/readAloud/synthetic')}
                      </span>
                    ) : null,
                })}
              </span>
            ),
        ].filter(Boolean),
        (_, i) => (
          <span key={i}>.</span>
        ),
      )}
    </p>
  )
}

export default Info
