import { Fragment } from 'react'
import { css } from 'glamor'

import { Interaction, mediaQueries, RawHtml } from '@project-r/styleguide'
import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'
import { PostcardPreview } from '../../Climatelab/PostcardPreview'

import Section from '../Section'

import withT from '../../../lib/withT'

const { P } = Interaction

const styles = {
  p: css({
    marginBottom: 20,
  }),
  actions: css({
    marginBottom: 20,
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    '& > button': {
      flexGrow: 1,
      margin: '5px 15px 0 0',
      minWidth: '120px',
      [mediaQueries.mUp]: {
        flexGrow: 0,
        margin: '5px 15px 0 0',
        minWidth: '160px',
      },
    },
  }),
}

// export const fragments = {
//   user: gql``,
// }

const Postcard = (props) => {
  const { t } = props

  // Is ticked when either???

  return (
    <Section
      heading={t('Onboarding/Sections/Postcard/heading')}
      // isTicked={hasConsented}
      // showContinue={hasConsented}
      {...props}
    >
      <Fragment>
        <RawHtml
          {...styles.p}
          type={Interaction.P}
          dangerouslySetInnerHTML={{
            __html: t(['Onboarding/Sections/Postcard/paragraph1'], null, ''),
          }}
        />
        <br />

        <QuestionnaireWithData
          slug={'klima-postkarte'}
          publicSubmission={false}
          hideCount
          submittedMessage={<P>{t('Onboarding/Sections/Postcard/merci1')}</P>}
          hideInvalid={true}
          hideReset={true}
        />
        <PostcardPreview t={t} />
      </Fragment>
    </Section>
  )
}

export default withT(Postcard)
