import React, { useState } from 'react'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'

import {
  fontFamilies,
  mediaQueries,
  useColorContext,
  Loader,
  Interaction,
} from '@project-r/styleguide'

const styles = {
  postcard: css({
    margin: '20px 0',
    width: '100%',
    aspectRatio: '16 / 9',
    display: 'flex',
    padding: '20px',
    borderWidth: '3px',
    borderStyle: 'solid',
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: '12px',
    lineHeight: '1.1',
    [mediaQueries.mUp]: {
      fontSize: '16px',
      lineHeight: '1.5',
    },
  }),
  textArea: css({
    width: '70%',
    marginRight: '50px',
    overflow: 'hidden',
    [mediaQueries.mUp]: {
      marginRight: '100px',
    },
  }),
  image: css({
    cursor: 'pointer',
    borderWidth: '3px',
    borderStyle: 'solid',
    maxWidth: '30%',
    alignSelf: 'start',
  }),
}

export const PostcardPreview = graphql(
  gql`
    query {
      questionnaire(slug: "klima-postkarte") {
        id
        userHasSubmitted
        questions {
          ... on QuestionInterface {
            id
            order
            text
            explanation
            private
            userAnswer {
              id
              payload
            }
          }
          ... on QuestionTypeText {
            maxLength
          }
          ... on QuestionTypeChoice {
            cardinality
            componentIdentifier
            options {
              label
              value
              category
              requireAddress
              imageUrl
            }
          }
        }
      }
    }
  `,
)(({ t, data }) => {
  const [colorScheme] = useColorContext()
  return (
    <>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          const { questions, userHasSubmitted } = data && data.questionnaire
          const imageOptions = questions && questions[0].options
          const imageSelction = questions[0].userAnswer.payload.value[0]

          const postcardText = questions[1].userAnswer.payload.value[0]

          const imageUrl = imageOptions.filter(
            (d) => d.value === imageSelction,
          )[0].imageUrl
          console.log(imageUrl)
          return (
            userHasSubmitted && (
              <>
                <div
                  {...styles.postcard}
                  {...colorScheme.set('borderColor', 'text')}
                >
                  <div {...styles.textArea}>
                    <span>{postcardText}</span>
                  </div>
                  <PoststampComponent imageUrl={imageUrl} />
                </div>
                <Interaction.P>
                  {t('Onboarding/Sections/Postcard/merci2')}
                </Interaction.P>
              </>
            )
          )
        }}
      />
    </>
  )
})

const PoststampComponent = ({ imageUrl }) => {
  console.log(imageUrl)
  return <img {...styles.image} src={imageUrl} />
}
