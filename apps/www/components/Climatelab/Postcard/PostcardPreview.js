import React from 'react'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import { Textfit } from 'react-textfit'

import {
  fontFamilies,
  mediaQueries,
  useColorContext,
  Loader,
  Interaction,
} from '@project-r/styleguide'

import { postcardCredits } from '../config'

const styles = {
  postcard: css({
    position: 'relative',
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
    overflow: 'hidden',
    wordBreak: 'normal',
    overflowWrap: 'break-word',
    width: '60%',
    borderRight: 'solid 1px #DADDDC',
    flexDirection: 'column',
    paddingRight: '20px',
    [mediaQueries.mUp]: {
      paddingRight: '40px',
    },
  }),
  credit: css({
    position: 'absolute',
    bottom: 0,
    paddingBottom: '5px',
    fontSize: '12px',
    [mediaQueries.mUp]: {
      fontSize: '14px',
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
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  }),
}

export const PostcardPreview = (props) => {
  const { t, postcard } = props
  const [colorScheme] = useColorContext()

  if (!postcard) return null
  const { questions, userHasSubmitted } = postcard
  const imageOptions = questions && questions[0].options
  const imageSelection =
    questions[0].userAnswer && questions[0].userAnswer.payload.value[0]

  const postcardText =
    questions[1].userAnswer && questions[1].userAnswer.payload.value

  const imageUrl =
    imageOptions &&
    imageOptions.filter((d) => d.value === imageSelection)[0]?.imageUrl

  console.log(imageSelection)

  return (
    userHasSubmitted && (
      <>
        <div
          {...styles.postcard}
          {...colorScheme.set('boxShadow', 'imageChoiceShadow')}
        >
          <div {...styles.credit}>
            {' '}
            {t('Climatelab/Postcard/PostcardPreview/credit', {
              credit: postcardCredits[imageSelection],
            })}
          </div>

          <div {...styles.textArea}>
            <Textfit mode='single'>{postcardText}</Textfit>
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
}

const PoststampComponent = ({ imageUrl }) => {
  return <img {...styles.image} src={imageUrl} />
}
