import React, { useState } from 'react'
import { css } from 'glamor'

import {
  fontFamilies,
  mediaQueries,
  useColorContext,
  Interaction,
} from '@project-r/styleguide'

import { postcardCredits } from '../config'

import { AutoTextSize } from 'auto-text-size'

const styles = {
  postcard: css({
    position: 'relative',
    backgroundColor: '#F9FBFF',
    margin: '0 0 20px 0',
    width: '100%',
    aspectRatio: '16 / 9',
    display: 'flex',
    padding: '20px',
    border: 'solid 2px f9f5ec',
    borderRadius: '2px',
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: '12px',
    lineHeight: '1.2',
    color: '#282828',
    [mediaQueries.mUp]: {
      fontSize: '16px',
      lineHeight: '1.5',
    },
  }),
  textArea: css({
    wordBreak: 'normal',
    overflowWrap: 'break-word',
    width: '60%',
    borderRight: 'solid 1px #DADDDC',
    marginBottom: '10px',
    paddingRight: '20px',
    [mediaQueries.mUp]: {
      paddingRight: '40px',
    },
  }),
  credit: css({
    position: 'absolute',
    bottom: 0,
    paddingBottom: '5px',
    fontSize: '0.5rem',
    [mediaQueries.mUp]: {
      fontSize: '0.75rem',
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
  poststampContainer: css({
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

  if (!userHasSubmitted) return null

  const imageOptions = questions && questions[0].options
  const imageSelection =
    questions[0].userAnswer && questions[0].userAnswer.payload.value[0]

  const postcardText =
    questions[1].userAnswer && questions[1].userAnswer.payload.value

  const imageUrl =
    imageOptions &&
    imageOptions.filter((d) => d.value === imageSelection)[0]?.imageUrl

  if (userHasSubmitted && !imageSelection && !postcardText) {
    return <div>XXX Postkarte verschickt, anonymisiert.</div>
  }

  return (
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
        <AutoTextSize mode='box'>{postcardText}</AutoTextSize>
      </div>

      <div {...styles.rightSide}>
        <div {...styles.poststampContainer}>
          <PoststampComponent imageUrl={imageUrl} />
        </div>
        <div {...styles.adressBlockContainer}>
          <div {...styles.adressBlock} />
          <div {...styles.adressBlock} />
          <div {...styles.adressBlock} />
        </div>
      </div>
    </div>
  )
}

const PoststampComponent = ({ imageUrl }) => {
  return <img {...styles.image} src={imageUrl} />
}
