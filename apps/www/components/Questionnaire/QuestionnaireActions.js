import { css } from 'glamor'

import { Button, InlineSpinner, Label } from '@project-r/styleguide'

import { useMe } from '../../lib/context/MeContext'
import { useTranslation } from '../../lib/withT'

const styles = {
  actions: css({
    margin: '10px 0',
    '& button': {
      marginRight: 20,
    },
  }),
}

export const PublicSubmissionInfo = ({ publicSubmission, context }) => {
  const { me } = useMe()
  const { t } = useTranslation()
  if (!publicSubmission) return null
  return (
    <Label>
      {t.first.elements([
        `questionnaire/${context}/privacy/${
          me?.hasPublicProfile ? 'public' : 'private'
        }`,
        `questionnaire/privacy/${me?.hasPublicProfile ? 'public' : 'private'}`,
      ])}
    </Label>
  )
}

const QuestionnaireActions = ({
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
  const { t } = useTranslation()

  const actionsDisabled = updating || invalid

  return (
    <div {...styles.actions}>
      <Button primary small onClick={onSubmit} disabled={actionsDisabled}>
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
        <Button small onClick={onSubmitAnonymized} disabled={actionsDisabled}>
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
          small
        >
          {t('questionnaire/reset')}
        </Button>
      )}
    </div>
  )
}

export default QuestionnaireActions
