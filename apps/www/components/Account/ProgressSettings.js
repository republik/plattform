import { useState, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import { useMe } from '../../lib/context/MeContext'
import { useTranslation } from '../../lib/withT'

import ErrorMessage from '../ErrorMessage'
import { P } from './Elements'
import { Loader, InlineSpinner, Checkbox } from '@project-r/styleguide'

import { withProgressApi } from '../Article/Progress/api'

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

const ProgressSettings = (props) => {
  const { revokeProgressOptOut, submitProgressOptOut, clearProgress } = props
  const { me, meLoading } = useMe()
  const { t } = useTranslation()

  const [mutating, setMutating] = useState(false)
  const [serverError, setServerError] = useState(null)

  const catchServerError = (error) => {
    setMutating(false)
    setServerError(error)
  }

  const revokeAndClearProgress = () => {
    revokeProgressOptOut().then(clearProgress).catch(catchServerError)
  }

  const hasAccepted = me.progressOptOut === false

  return (
    <Loader
      loading={meLoading}
      render={() => (
        <Fragment>
          <P style={{ margin: '20px 0' }}>
            {t('article/progressprompt/description/feature')}
          </P>
          <Checkbox
            checked={hasAccepted}
            disabled={mutating}
            onChange={(_, checked) => {
              if (
                hasAccepted &&
                !window.confirm(t('account/progress/consent/confirmRevoke'))
              ) {
                return
              }
              setMutating(true)
              const finish = () => {
                setMutating(false)
              }
              const consentMutation = hasAccepted
                ? revokeAndClearProgress
                : submitProgressOptOut
              consentMutation().then(finish).catch(catchServerError)
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
        </Fragment>
      )}
    />
  )
}

export default compose(withProgressApi)(ProgressSettings)
