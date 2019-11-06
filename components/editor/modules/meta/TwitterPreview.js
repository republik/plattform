import React from 'react'
import { css } from 'glamor'
import { gray2x1 } from '../../utils/placeholder'

const styles = {
  twitterContainer: css({
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
    width: 506,
    borderRadius: '.42857em',
    overflow: 'hidden'
  }),
  twitterImage: css({
    width: 506,
    height: 254,
    backgroundSize: 'cover'
  }),
  twitterText: css({
    padding: '10.5px 14px',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    maxHeight: 120,
    overflow: 'hidden'
  }),
  twitterTitle: css({
    maxHeight: '1.3em',
    fontSize: '1em',
    lineHeight: '1.3em',
    margin: '0 0 .15em',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontWeight: 'bold'
  }),
  twitterDescription: css({
    fontSize: '1em',
    lineHeight: '1.3em',
    marginTop: '.32333em',
    overflow: 'hidden',
    maxHeight: '2.6em'
  }),
  twitterDomain: css({
    fontSize: '1em',
    lineHeight: '1.3em',
    marginTop: '.32333em',
    textTransform: 'lowercase',
    color: '#8899A6',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  })
}

const TwitterPreview = ({ data }) => (
  <div {...styles.twitterContainer}>
    <div
      {...styles.twitterImage}
      style={{
        backgroundImage: `url(${data.get('twitterImage') ||
          data.get('image') ||
          gray2x1})`
      }}
    />
    <div {...styles.twitterText}>
      <div {...styles.twitterTitle}>
        {data.get('twitterTitle') || data.get('title')}
      </div>
      <div {...styles.twitterDescription}>
        {data.get('twitterDescription') || data.get('description')}
      </div>
      <div {...styles.twitterDomain}>republik.ch</div>
    </div>
  </div>
)

export default TwitterPreview
