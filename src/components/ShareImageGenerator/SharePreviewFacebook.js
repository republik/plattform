import React from 'react'
import { css } from 'glamor'

const styles = {
  container: css({
    backgroundColor: '#fff',
    color: '#000',
    width: 600,
    padding: '10px 12px',
    maxHeight: 120,
    overflow: 'hidden'
  }),
  title: css({
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    fontWeight: 500,
    lineHeight: '22px',
    maxHeight: 110,
    overflow: 'hidden',
    marginBottom: 5,
    wordWrap: 'break-word'
  }),
  description: css({
    fontFamily: 'sans-serif',
    fontSize: 12,
    lineHeight: '16px',
    maxHeight: 80,
    overflow: 'hidden'
  }),
  domain: css({
    fontFamily: 'sans-serif',
    fontSize: 11,
    lineHeight: '11px',
    textTransform: 'uppercase',
    color: '#90949c',
    paddingTop: 9
  })
}

const SharePreviewFacebook = ({ title, description }) => (
  <div {...styles.container}>
    <div {...styles.title}>{title}</div>
    <div {...styles.description}>{description}</div>
    <div {...styles.domain}>republik.ch</div>
  </div>
)

export default SharePreviewFacebook
