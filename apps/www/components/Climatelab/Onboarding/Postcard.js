import { Fragment } from 'react'
import { css } from 'glamor'

import { Interaction, mediaQueries, RawHtml } from '@project-r/styleguide'

import Section from '../../Onboarding/Section'

import withT from '../../../lib/withT'
import PostcardGenerator from '../Postcard/PostcardGenerator'

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
      heading={t('Climatelab/Onboarding/Postcard/heading')}
      // isTicked={hasConsented}
      // showContinue={hasConsented}
      {...props}
    >
      <Fragment>
        <RawHtml
          {...styles.p}
          type={Interaction.P}
          dangerouslySetInnerHTML={{
            __html: t(['Climatelab/Onboarding/Postcard/paragraph1'], null, ''),
          }}
        />
        <br />

        <PostcardGenerator t={t} />
      </Fragment>
    </Section>
  )
}

export default withT(Postcard)
