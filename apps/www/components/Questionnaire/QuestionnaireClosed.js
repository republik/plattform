import { css } from 'glamor'

import { Interaction, A, useColorContext } from '@project-r/styleguide'

import Results from './Results'
import { useTranslation } from '../../lib/withT'
import PlainButton from './Submissions/PlainButton'

const { P } = Interaction

const styles = {
  closed: css({
    marginTop: 35,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    textAlign: 'center',
    marginBottom: 30,
  }),
}

const QuestionnaireClosed = ({ submitted, onResubmit, onRevoke }) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  return (
    <>
      <div {...styles.closed} {...colorScheme.set('backgroundColor', 'alert')}>
        <P>
          {submitted ? t('questionnaire/thankyou') : t('questionnaire/ended')}
        </P>
        {submitted && (onResubmit || onRevoke) && (
          <>
            <P>
              <PlainButton
                onClick={(e) => {
                  e.preventDefault()
                  if (onResubmit) {
                    onResubmit()
                  } else {
                    onRevoke()
                  }
                }}
              >
                {t(
                  `questionnaire/thankyou/${
                    onResubmit ? 'resubmit' : 'revoke'
                  }`,
                )}
              </PlainButton>
            </P>
          </>
        )}
      </div>
    </>
  )
}

export default QuestionnaireClosed
