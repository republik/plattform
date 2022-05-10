import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '../../theme/fonts'

export const previewImageStyle = css({
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  // boxshadow of image is 2x that of text container beacuse
  // a scale 0.5 is applied on it.
  boxShadow: '0px 0px 2px 2px rgb(204, 214, 221)',
})

export const TWITTER_CARD_PREVIEW_WIDTH = 504

const styles = {
  container: css({
    backgroundColor: '#fff',
    color: '#000',
    width: TWITTER_CARD_PREVIEW_WIDTH,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    boxShadow: '0px 0px 1px 1px rgb(204, 214, 221)',
    padding: '10.5px 14px',
    maxHeight: 120,
    overflow: 'hidden',
    ...fontStyles.sansSerifRegular,
    fontSize: 15,
    lineHeight: '1.33em',
  }),
  title: css({
    maxHeight: '1.33em',
    fontSize: '1em',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: '#000',
  }),
  description: css({
    fontSize: '1em',
    marginTop: '.2em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    maxHeight: '2.66em',
    color: 'rgb(83, 100, 113)',
  }),
  domain: css({
    fontSize: '1em',
    marginTop: '.2em',
    textTransform: 'lowercase',
    color: 'rgb(83, 100, 113)',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }),
}

const SharePreviewTwitter = ({ title, description }) => (
  <div {...styles.container}>
    <div {...styles.title}>{title}</div>
    <div {...styles.description}>{description}</div>
    <div {...styles.domain}>republik.ch</div>
  </div>
)

export default SharePreviewTwitter
