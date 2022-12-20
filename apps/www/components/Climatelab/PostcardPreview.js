import React, { useMemo } from 'react'
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
    border: 'solid 2px white',
    borderRadius: '2px',
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: '12px',
    lineHeight: '1.2',
    [mediaQueries.mUp]: {
      fontSize: '16px',
      lineHeight: '1.5',
    },
  }),
  textArea: css({
    width: '60%',
    paddingRight: '20px',
    overflow: 'hidden',
    borderRight: 'solid 1px #DADDDC',
    wordBreak: 'normal',
    overflowWrap: 'break-word',

    [mediaQueries.mUp]: {
      paddingRight: '40px',
    },
  }),
  rightSide: css({
    display: 'flex',
    flexDirection: 'column',
    width: '40%',
    paddingLeft: '20px',
    [mediaQueries.mUp]: {
      paddingLeft: '40px',
    },
  }),
  image: css({
    cursor: 'pointer',
    maxWidth: '80%',
    alignSelf: 'flex-end',
    boxShadow: '2px 2px 3px 3px rgba(0,0,0,0)',
  }),
  adressBlock: css({
    borderBottom: 'solid 1px #DADDDC',
    height: '25px',
    [mediaQueries.mUp]: {
      height: '50px',
    },
  }),
  adressBlockContainer: css({
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: '3px',
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
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
          ... on QuestionTypeImageChoice {
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
          if (!data?.questionnaire) return null
          const { questions, userHasSubmitted } = data.questionnaire
          const imageOptions = questions && questions[0].options
          const imageSelection =
            questions[0].userAnswer && questions[0].userAnswer.payload.value[0]

          const postcardText =
            questions[1].userAnswer && questions[1].userAnswer.payload.value

          const imageUrl =
            imageOptions &&
            imageOptions.filter((d) => d.value === imageSelection)[0]?.imageUrl

          const fontSizeByTextLength = (textLength) => {
            if (textLength < 50) {
              return '250%'
            }
            if (textLength < 100) {
              return '150%'
            }
            if (textLength < 200) {
              return '125%'
            }
            if (textLength < 300) {
              return '105%'
            }
            if (textLength < 400) {
              return '95%'
            }
            if (textLength < 500) {
              return '85%'
            }
          }

          console.log(postcardText && fontSizeByTextLength(postcardText.length))

          return (
            userHasSubmitted && (
              <>
                <div
                  {...styles.postcard}
                  {...colorScheme.set('boxShadow', 'imageChoiceShadow')}
                >
                  <div
                    {...styles.textArea}
                    style={{
                      fontSize: fontSizeByTextLength(postcardText.length),
                    }}
                  >
                    <span>{postcardText}</span>
                  </div>
                  <div {...styles.rightSide}>
                    <PoststampComponent imageUrl={imageUrl} />
                    <div {...styles.adressBlockContainer}>
                      <div {...styles.adressBlock} />
                      <div {...styles.adressBlock} />
                      <div {...styles.adressBlock} />
                    </div>
                  </div>
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
  return <img {...styles.image} src={imageUrl} />
}
