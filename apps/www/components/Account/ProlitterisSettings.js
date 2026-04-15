import { useState } from 'react'
import { css } from 'glamor'
import { useTranslation } from '../../lib/withT'

import Box from '../Frame/Box'
import ErrorMessage from '../ErrorMessage'
import { P } from './Elements'
import { InlineSpinner, Checkbox, Loader } from '@project-r/styleguide'

import { gql, useMutation } from '@apollo/client'
import { useMe } from '../../lib/context/MeContext'
import { PROLITTERIS_OPT_OUT_CONSENT } from '../../lib/constants'

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

const userProlitterisConsentFragment = `
  fragment ProlitterisConsent on User {
    prolitterisOptOut: hasConsentedTo(name: "${PROLITTERIS_OPT_OUT_CONSENT}")
  }
`

const CONSENT_TO_PROLITTERIS = gql`
  mutation submitConsent {
    submitConsent(name: "${PROLITTERIS_OPT_OUT_CONSENT}") {
      id
      ...ProlitterisConsent
    }
  }
  ${userProlitterisConsentFragment}
`

const REVOKE_PROLITTERIS = gql`
  mutation revokeConsent {
    revokeConsent(name: "${PROLITTERIS_OPT_OUT_CONSENT}") {
      id
      ...ProlitterisConsent
    }
  }
  ${userProlitterisConsentFragment}
`

const ProlitterisSettings = () => {
  const { me, meLoading } = useMe()
  const { t } = useTranslation()
  const [revokeOptOut] = useMutation(REVOKE_PROLITTERIS)
  const [submitOptOut] = useMutation(CONSENT_TO_PROLITTERIS)
  const [mutating, isMutating] = useState(false)
  const [serverError, setServerError] = useState(false)
  const isActive = me && me.prolitterisOptOut !== true

  return (
    <Loader
      loading={meLoading}
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
