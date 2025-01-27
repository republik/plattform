import { css } from 'glamor'
import compose from 'lodash/flowRight'

import { Label, Button, InlineSpinner } from '@project-r/styleguide'

import withT from '../../lib/withT'
import { useMe } from '../../lib/context/MeContext'

const styles = {
  actions: css({
    margin: '15px 0',
    '& button': {
      margin: '5px 20px 5px 0',
    },
  }),
}

const PublicSubmissionInfo = ({ publicSubmission, context, t }) => {
  const { me } = useMe()
  if (!publicSubmission) return null
  return (
    <div style={{ marginTop: 10 }}>
      <Label>
        {t.first.elements([
          `questionnaire/${context}/privacy/${
            me?.hasPublicProfile ? 'public' : 'private'
          }`,
          `questionnaire/privacy/${
            me?.hasPublicProfile ? 'public' : 'private'
          }`,
        ])}
      </Label>
    </div>
  )
}

export default compose(withT)(
  ({
    t,
    onSubmit,
    onSubmitAnonymized,
    onReset,
    isResubmitAnswers,
    updating,
    invalid,
    publicSubmission,
    context,
    showAnonymize,
  }) => {
    const actionsDisabled = updating || invalid
    return (
      <div {...styles.actions}>
        <Button primary onClick={onSubmit} disabled={actionsDisabled}>
          {updating ? (
            <InlineSpinner size={15} />
          ) : (
            t.first.elements([
              `questionnaire/${context}/${
                isResubmitAnswers
                  ? 'update'
                  : publicSubmission
                  ? 'publish'
                  : 'submit'
              }`,
              `questionnaire/${
                isResubmitAnswers
                  ? 'update'
                  : publicSubmission
                  ? 'publish'
                  : 'submit'
              }`,
            ])
          )}
        </Button>
        {showAnonymize && onSubmitAnonymized && (
          <Button onClick={onSubmitAnonymized} disabled={actionsDisabled}>
            {t('questionnaire/submitanonym')}
          </Button>
        )}
        {!!onReset && (
          <Button
            onClick={() => {
              if (window.confirm(t('questionnaire/reset/confirm'))) {
                onReset()
              }
            }}
            disabled={actionsDisabled}
            style={{ padding: 0 }}
            naked
            primary
          >
            {t('questionnaire/reset')}
          </Button>
        )}
        <PublicSubmissionInfo
          publicSubmission={publicSubmission}
          context={context}
          t={t}
        />
      </div>
    )
  },
)
