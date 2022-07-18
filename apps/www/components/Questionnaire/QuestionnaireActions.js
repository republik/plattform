import { css } from 'glamor'
import compose from 'lodash/flowRight'

import { Button, Interaction, InlineSpinner } from '@project-r/styleguide'

import withT from '../../lib/withT'

const styles = {
  actions: css({
    margin: '15px 0',
    '& button': {
      margin: '5px 20px 5px 0',
    },
  }),
}

export default compose(withT)(
  ({ t, onSubmit, onReset, isResubmitAnswers, updating, invalid }) => {
    return (
      <div {...styles.actions}>
        <Button primary onClick={onSubmit} disabled={updating || invalid}>
          {updating ? (
            <InlineSpinner size={40} />
          ) : (
            t(`questionnaire/${isResubmitAnswers ? 'update' : 'submit'}`)
          )}
        </Button>
        {invalid ? (
          <Interaction.P>{t('questionnaire/invalid')}</Interaction.P>
        ) : (
          !!onReset && (
            <Button
              onClick={() => {
                if (window.confirm(t('questionnaire/reset/confirm'))) {
                  onReset()
                }
              }}
              style={{ padding: 0 }}
              small
              naked
            >
              {t('questionnaire/reset')}
            </Button>
          )
        )}
      </div>
    )
  },
)
