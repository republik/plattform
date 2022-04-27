import { css } from 'glamor'
import compose from 'lodash/flowRight'

import { colors, Interaction, A } from '@project-r/styleguide'

import withT from '../../lib/withT'
import Results from './Results'

const { Headline, P } = Interaction

const styles = {
  closed: css({
    marginTop: 35,
    background: colors.primaryBg,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    textAlign: 'center',
    marginBottom: 30,
  }),
}

export default compose(withT)(({ t, slug, submitted, showResults }) => {
  return (
    <>
      <Headline>{t('questionnaire/title')}</Headline>
      <div {...styles.closed}>
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
          <P style={{ marginBottom: 20, color: colors.error }}>
            Diese Resultate werden{' '}
            <Interaction.Emphasis>nur intern</Interaction.Emphasis> angezeigt.
          </P>
          <Results canDownload slug={slug} />
        </>
      )}
    </>
  )
})
