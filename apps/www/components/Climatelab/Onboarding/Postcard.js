import { Fragment } from 'react'
import { css } from 'glamor'
import { gql } from '@apollo/client'

import { Interaction, mediaQueries, RawHtml } from '@project-r/styleguide'

import Section from '../../Onboarding/Section'

import withT from '../../../lib/withT'
import PostcardGenerator from '../Postcard/PostcardGenerator'

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

export const fragments = {
  postcard: gql`
    fragment Postcard on queries {
      postcard: questionnaire(slug: "klima-postkarte") {
        userHasSubmitted
        questions {
          ... on QuestionInterface {
            userAnswer {
              payload
            }
          }
          ... on QuestionTypeImageChoice {
            options {
              value
              imageUrl
            }
          }
        }
      }
    }
  `,
}

const Postcard = (props) => {
  const { t, postcard } = props

  return (
    <Section
      heading={t('Climatelab/Onboarding/Postcard/heading')}
      isTicked={postcard.userHasSubmitted}
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
        <PostcardGenerator t={t} postcard={postcard} />
      </Fragment>
    </Section>
  )
}

export default withT(Postcard)
