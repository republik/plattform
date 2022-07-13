import { css, merge } from 'glamor'
import compose from 'lodash/flowRight'

import { Button, A, InlineSpinner } from '@project-r/styleguide'

import withT from '../../lib/withT'

const styles = {
  actions: css({
    textAlign: 'center',
    margin: '20px auto 20px auto',
  }),
  actionsLeft: css({
    textAlign: 'left',
  }),
  reset: css({
    textAlign: 'center',
    marginTop: 10,
  }),
  resetLeft: css({
    display: 'inline-block',
    textAlign: 'left',
    lineHeight: '60px',
    marginTop: 10,
    marginLeft: 20,
  }),
}

export default compose(withT)(
  ({ t, onSubmit, onReset, updating, invalid, leftAlign }) => {
    return (
      <div {...merge(styles.actions, leftAlign && styles.actionsLeft)}>
        <Button primary onClick={onSubmit} disabled={updating || invalid}>
          {updating ? <InlineSpinner size={40} /> : t('questionnaire/submit')}
        </Button>
        {!!onReset && (
          <div {...merge(styles.reset, leftAlign && styles.resetLeft)}>
            {invalid ? (
              t('questionnaire/invalid')
            ) : (
              <A
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  onReset()
                }}
              >
                {t('questionnaire/cancel')}
              </A>
            )}
          </div>
        )}
      </div>
    )
  },
)
