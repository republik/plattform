import React from 'react'
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
    backgroundColor: '#F9FBFF',
    margin: '20px 0',
    width: '100%',
    aspectRatio: '16 / 9',
    display: 'flex',
    padding: '20px',
    border: 'solid 2px f9f5ec',
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
  postcardContainer: css({
    maxWidth: '80%',
    alignSelf: 'flex-end',
  }),
  image: css({
    display: 'block',
    width: '100%',
    borderImage: 'url(/static/climatelab/border-image.png) 32 round',
    borderWidth: '8px',
    borderStyle: 'solid',
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
    paddingBottom: '3px',
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  }),
}

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

export const PostcardPreview = graphql(
  gql`
    query {
      questionnaire(slug: "klima-postkarte") {
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
                      fontSize: fontSizeByTextLength(
                        postcardText && postcardText.length,
                      ),
                    }}
                  >
                    <span>{postcardText}</span>
                  </div>
                  <div {...styles.rightSide}>
                    <div {...styles.postcardContainer}>
                      <PoststampComponent imageUrl={imageUrl} />
                    </div>
                    <div {...styles.adressBlockContainer}>
                      <div {...styles.adressBlock} />
                      <div {...styles.adressBlock} />
                      <div {...styles.adressBlock} />
                    </div>
                  </div>
                </div>
                <Interaction.P>
                  {t('Climatelab/Postcard/PostcardPreview/merci2')}
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
