import { css } from 'glamor'

import { Interaction, A, useColorContext } from '@project-r/styleguide'

import Results from './Results'
import { useTranslation } from '../../lib/withT'

const { Headline, P } = Interaction

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

const QuestionnaireClosed = ({ slug, submitted, showResults }) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  return (
    <>
      <Headline>{t('questionnaire/title')}</Headline>
      <div {...styles.closed} {...colorScheme.set('backgroundColor', 'alert')}>
        <P>
          {submitted
            ? t.elements('questionnaire/thankyou', {
                metaLink: (
                  <A href='/meta'>{t('questionnaire/thankyou/metaText')}</A>
                ),
              })
            : t('questionnaire/ended')}
        </P>
      </div>
      {showResults && (
        <>
          <P style={{ marginBottom: 20 }}>
            <span {...colorScheme.set('color', 'error')}>
              Diese Resultate werden{' '}
              <Interaction.Emphasis>nur intern</Interaction.Emphasis> angezeigt.
            </span>
          </P>
          <Results canDownload slug={slug} />
        </>
      )}
    </>
  )
}

export default QuestionnaireClosed
