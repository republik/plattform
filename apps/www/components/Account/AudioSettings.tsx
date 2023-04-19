import { Fragment, useState } from 'react'
import { css } from 'glamor'

import Box from '../Frame/Box'
import ErrorMessage from '../ErrorMessage'
import { P } from './Elements'
import { Loader, InlineSpinner, Checkbox } from '@project-r/styleguide'
import {
  useAudioAutoPlayPrefQuery,
  useConsentToAudioAutoPlayOptOutMutation,
  useRevokeAudioAutoPlayOptOutMutation,
} from '../Audio/graphql/AutoPlayConsentHook'
import { useTranslation } from '../../lib/withT'
import { useMe } from '../../lib/context/MeContext'

const styles = {
  headline: css({
    margin: '80px 0 30px 0',
  }),
  spinnerWrapper: css({
    display: 'inline-block',
    height: 0,
    marginLeft: 15,
    verticalAlign: 'middle',
    '& > span': {
      display: 'inline',
    },
  }),
  label: css({
    display: 'block',
    paddingLeft: '28px',
  }),
}

export const AudioSettings = () => {
  const { t } = useTranslation()
  const { hasActiveMembership } = useMe()
  const { data: pref, loading: prefLoading } = useAudioAutoPlayPrefQuery()
  const [giveConsent] = useConsentToAudioAutoPlayOptOutMutation()
  const [revokeConsent] = useRevokeAudioAutoPlayOptOutMutation()
  const [isMutating, setIsMutating] = useState(false)
  const [serverError, setServerError] = useState(null)

  return (
    <Loader
      loading={prefLoading}
      render={() => {
        const hasOptedOut = pref?.me?.shouldNotAutoPlay === true

        return (
          <Fragment>
            <P style={{ margin: '20px 0' }}>{t('account/audio/description')}</P>
            <Checkbox
              checked={!hasOptedOut}
              disabled={isMutating}
              onChange={(_, checked) => {
                setIsMutating(true)
                const consentMutation = hasOptedOut
                  ? revokeConsent
                  : giveConsent
                consentMutation()
                  .catch((error) => setServerError(error))
                  .finally(() => setIsMutating(false))
              }}
            >
              <span {...styles.label}>
                {t('account/audio/consent')}
                {isMutating && (
                  <span {...styles.spinnerWrapper}>
                    <InlineSpinner size={24} />
                  </span>
                )}
              </span>
            </Checkbox>
            {!hasActiveMembership && (
              <Box style={{ margin: '10px 0', padding: 15 }}>
                <P>{t('account/progress/consent/noMembership')}</P>
              </Box>
            )}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            {serverError && <ErrorMessage error={serverError} />}
          </Fragment>
        )
      }}
    />
  )
}
