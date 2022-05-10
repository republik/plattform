import React from 'react'
import { css } from 'glamor'

export const FACEBOOK_CARD_PREVIEW_WIDTH = 590

const styles = {
  container: css({
    backgroundColor: 'rgb(240, 242, 245)',
    color: 'rgb(28, 30, 33)',
    width: FACEBOOK_CARD_PREVIEW_WIDTH,
    padding: '10px 12px',
    maxHeight: 120,
    overflow: 'hidden',
    fontFamily:
      'system-ui, -apple-system, system-ui, ".SFNSText-Regular", sans-serif',
  }),
  title: css({
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '1.17em',
    maxHeight: 110,
    overflow: 'hidden',
    marginBottom: 3,
    wordWrap: 'break-word',
    color: 'rgb(5, 5, 5)',
  }),
  description: css({
    fontFamily: 'sans-serif',
    fontSize: 14,
    lineHeight: '1.33em',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: 'rgb(101, 103, 107)',
  }),
  domain: css({
    fontFamily: 'sans-serif',
    fontSize: 12,
    lineHeight: '1.23em',
    textTransform: 'uppercase',
    color: 'rgb(101, 103, 107)',
    paddingBottom: 4,
  }),
}

const SharePreviewFacebook = ({ title, description }) => (
  <div {...styles.container}>
    <div {...styles.domain}>republik.ch</div>
    <div {...styles.title}>{title}</div>
    <div {...styles.description}>{description}</div>
  </div>
)

export default SharePreviewFacebook
