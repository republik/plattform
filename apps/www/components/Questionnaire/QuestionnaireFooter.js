import { css } from 'glamor'

import {
  Interaction,
  useColorContext,
  mediaQueries,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'
import ErrorMessage from '../ErrorMessage'

const { P } = Interaction

const styles = {
  footer: css({
    position: 'sticky',
    bottom: 0,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    padding: '10px 15px',
    zIndex: 20,
    marginRight: -15,
    marginLeft: -15,
    [mediaQueries.mUp]: {
      padding: '10px 0',
      margin: 0,
    },
  }),
}

export const actionStyles = css({
  textAlign: 'center',
  margin: '20px auto 20px auto',
})

const QuestionnaireFooter = ({
  error,
  hideCount,
  questionCount,
  userAnswerCount,
  children,
}) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  return (
    <div
      {...styles.footer}
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('borderColorTop', 'divider')}
    >
      {error && <ErrorMessage style={{ margin: 0 }} error={error} />}
      {!hideCount && (
        <P>
          {t('questionnaire/header', {
            questionCount,
            userAnswerCount,
          })}
        </P>
      )}
      {children}
    </div>
  )
}

export default QuestionnaireFooter
