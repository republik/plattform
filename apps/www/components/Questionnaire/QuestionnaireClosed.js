import { css } from 'glamor'

import { Interaction, useColorContext } from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'
import PlainButton from './Submissions/legacy/PlainButton'

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

const QuestionnaireClosed = ({
  submitted,
  onResubmit,
  onRevoke,
  publicSubmission,
}) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  return (
    <>
      <div {...styles.closed} {...colorScheme.set('backgroundColor', 'alert')}>
        <P>
          {submitted
            ? t(`questionnaire/thankyou${publicSubmission ? '/public' : ''}`)
            : t('questionnaire/ended')}
        </P>
        {submitted && (onResubmit || onRevoke) && (
          <>
            <P>
              {onResubmit && (
                <PlainButton
                  onClick={(e) => {
                    e.preventDefault()
                    onResubmit()
                  }}
                >
                  {t('questionnaire/thankyou/resubmit')}
                </PlainButton>
              )}
              {onResubmit && onRevoke && ' · '}
              {onRevoke && (
                <PlainButton
                  onClick={(e) => {
                    e.preventDefault()
                    onRevoke()
                  }}
                >
                  {t('questionnaire/thankyou/revoke')}
                </PlainButton>
              )}
            </P>
          </>
        )}
      </div>
    </>
  )
}

export default QuestionnaireClosed
