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
  Checkbox,
  CalloutMenu,
} from '@project-r/styleguide'

import { intersperse } from '../../../lib/utils/helpers'
import { useTranslation } from '../../../lib/withT'
import EventObjectType from '../graphql/EventObjectType'

import useDocumentSubscriptionQuery from '../graphql/useDocumentSubscriptionQuery'
import useSubscribeDocumentMutation from '../graphql/useSubscribeDocumentMutation'
import useUnsubscribeDocumentMutation from '../graphql/useUnsubscribeDocumentMutation'

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

const PlaySyntheticReadAloud = ({ onPlay, children }) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  return (
    <span {...colorScheme.set('color', 'textSoft')}>
      <button
        {...plainButtonRule}
        style={{ textDecoration: 'underline', display: 'inline' }}
        onClick={onPlay}
      >
        {children ? children : t('article/actionbar/audio/info/play-synth')}
      </button>
    </span>
  )
}

const SubscribeReadAloud = ({ document }) => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()

  const { data, loading: loadingQuery } = useDocumentSubscriptionQuery({
    variables: {
      path: document.meta?.path,
      onlyMe: true,
    },
    skip: !document.meta?.path,
  })

  const [subscribe, { loading: loadingSubscribe }] =
    useSubscribeDocumentMutation()
  const [unsubscribe, { loading: loadingUnsubscribe }] =
    useUnsubscribeDocumentMutation()

  const loading = loadingQuery || loadingSubscribe || loadingUnsubscribe

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
  const { kind, mp3, contributorsVoice, willBeReadAloud } = useMemo(() => {
    const kind = document.meta?.audioSource?.kind
    const mp3 = document.meta?.audioSource?.mp3
    const contributorsVoice =
      document.meta?.contributors?.filter((c) => c.kind === 'voice') || []
    const willBeReadAloud = document.meta?.willBeReadAloud

    return { kind, mp3, contributorsVoice, willBeReadAloud }
  }, [document.id])

  return (
    <p {...styles.audioInfo} {...colorScheme.set('color', 'textSoft')}>
      {intersperse(
        [
          kind === 'readAloud' && !!mp3 && (
            <Contributors contributors={contributorsVoice} />
          ),
          !willBeReadAloud && kind === 'syntheticReadAloud' && !!mp3 && (
            <PlaySyntheticReadAloud onPlay={handlePlay} />
          ),
          (kind !== 'readAloud' || !mp3) && !!willBeReadAloud && (
            <span>
              {t.elements('article/actionbar/audio/info/readAloud', {
                subscribe: (
                  <CalloutMenu
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
                        {t('article/actionbar/audio/info/readAloud/subscribe')}
                      </button>
                    )}
                  >
                    <SubscribeReadAloud document={document} />
                  </CalloutMenu>
                ),
                synthetic:
                  kind === 'syntheticReadAloud' && !!mp3 ? (
                    <span>
                      {' '}
                      {/* Don't question the space, we need it. */}
                      {t.elements(
                        'article/actionbar/audio/info/readAloud/synthetic',
                        {
                          action: (
                            <PlaySyntheticReadAloud onPlay={handlePlay}>
                              anhören
                            </PlaySyntheticReadAloud>
                          ),
                        },
                      )}
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
