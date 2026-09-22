import { useMe } from '@/lib/context/MeContext'
import { useTranslation } from '@/lib/withT'
import { useMutation } from '@apollo/client'

import { Checkbox, InlineSpinner, Loader } from '@project-r/styleguide'
import { css } from 'glamor'
import { useState } from 'react'
import {
  ClearProgressDocument,
  RevokeConsentDocument,
  SubmitConsentDocument,
} from '../../../graphql/republik-api/__generated__/gql/graphql'
import ErrorMessage from '../ErrorMessage'
import { P } from './Elements'

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

const ProgressSettings = () => {
  // Since progress is an opt out, "revokeProgressOptOut" actually is
  // an opt in for the Progress feature
  // while submitProgressOptOut revokes consent to the Progress feature
  // this is consistent with how other consent settings work
  const [submitProgressOptOut] = useMutation(SubmitConsentDocument)
  const [clearProgress] = useMutation(ClearProgressDocument)
  const [revokeProgressOptOut] = useMutation(RevokeConsentDocument)

  const { meLoading, progressConsent } = useMe()
  const { t } = useTranslation()

  const [mutating, setMutating] = useState(false)
  const [serverError, setServerError] = useState(null)

  const catchServerError = (error) => {
    setMutating(false)
    setServerError(error)
  }

  // when the user opts out of progress, we also clear their progress
  const submitProgressOptOutAndClearProgress = () =>
    submitProgressOptOut().then(clearProgress).catch(catchServerError)

  return (
    <Loader
      loading={meLoading}
      render={() => (
        <>
          <P style={{ margin: '20px 0' }}>
            {t('article/progressprompt/description/feature')}
          </P>
          <Checkbox
            checked={progressConsent}
            disabled={mutating}
            onChange={() => {
              if (
                progressConsent &&
                !window.confirm(t('account/progress/consent/confirmRevoke'))
              ) {
                return
              }
              setMutating(true)
              const consentMutation = progressConsent
                ? submitProgressOptOutAndClearProgress
                : revokeProgressOptOut
              consentMutation()
                .then(() => setMutating(false))
                .catch(catchServerError)
            }}
          >
            <span {...styles.label}>
              {t('account/progress/consent/label')}
              {mutating && (
                <span {...styles.spinnerWrapper}>
                  <InlineSpinner size={24} />
                </span>
              )}
            </span>
          </Checkbox>
          {serverError && <ErrorMessage error={serverError} />}
        </>
      )}
    />
  )
}

export default ProgressSettings
