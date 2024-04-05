import { useState } from 'react'
import { css } from 'glamor'
import { useTranslation } from '../../lib/withT'

import ErrorMessage from '../ErrorMessage'
import { P } from './Elements'
import { InlineSpinner, Checkbox, Loader } from '@project-r/styleguide'

import { useMutation, useQuery } from '@apollo/client'
import { PROLITTERIS_OPT_OUT_CONSENT } from '../../lib/constants'
import {
  ProlitterisConsentQueryDocument,
  RevokeProlitterisConsentDocument,
  SubmitProlitterisConsentDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'

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

const ProlitterisSettings = () => {
  const { t } = useTranslation()
  const { data, loading, error } = useQuery(ProlitterisConsentQueryDocument, {
    variables: { prolitterisConsent: PROLITTERIS_OPT_OUT_CONSENT },
  })
  const [revokeOptOut] = useMutation(RevokeProlitterisConsentDocument, {
    variables: {
      prolitterisConsent: PROLITTERIS_OPT_OUT_CONSENT,
    },
  })
  const [submitOptOut] = useMutation(SubmitProlitterisConsentDocument, {
    variables: {
      prolitterisConsent: PROLITTERIS_OPT_OUT_CONSENT,
    },
  })

  const [mutating, isMutating] = useState(false)
  const [serverError, setServerError] = useState<Error | null>(null)
  const isActive = data && data.me?.prolitterisOptOut !== true

  return (
    <Loader
      loading={loading}
      error={error?.graphQLErrors?.[0]}
      render={() => (
        <>
          <P style={{ margin: '20px 0' }}>
            {t('account/prolitteris/description')}
          </P>
          <Checkbox
            checked={isActive}
            disabled={mutating}
            onChange={() => {
              isMutating(true)
              const consentMutation = isActive ? submitOptOut : revokeOptOut
              consentMutation()
                .then(() => isMutating(false))
                .catch((err) => {
                  setServerError(err)
                  isMutating(false)
                })
            }}
          >
            <span {...styles.label}>
              {t('account/prolitteris/consent/label')}
              {mutating['consent'] && (
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

export default ProlitterisSettings
