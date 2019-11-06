import React from 'react'
import { css } from 'glamor'
import { gray2x1 } from '../../utils/placeholder'

const styles = {
  fbContainer: css({
    backgroundColor: '#fff',
    color: '#000',
    width: 476
  }),
  fbImage: css({
    width: 476,
    height: 249,
    backgroundSize: 'cover'
  }),
  fbText: css({
    padding: '10px 12px',
    maxHeight: 120,
    overflow: 'hidden'
  }),
  fbTitle: css({
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    fontWeight: 500,
    lineHeight: '22px',
    maxHeight: 110,
    overflow: 'hidden',
    marginBottom: 5,
    wordWrap: 'break-word'
  }),
  fbDescription: css({
    fontFamily: 'sans-serif',
    fontSize: 12,
    lineHeight: '16px',
    maxHeight: 80,
    overflow: 'hidden'
  }),
  fbDomain: css({
    fontFamily: 'sans-serif',
    fontSize: 11,
    lineHeight: '11px',
    textTransform: 'uppercase',
    color: '#90949c',
    paddingTop: 9
  })
}

const FBPreview = ({ data }) => (
  <div {...styles.fbContainer}>
    <div
      {...styles.fbImage}
      style={{
        backgroundImage: `url(${data.get('facebookImage') ||
          data.get('image') ||
          gray2x1})`
      }}
    />
    <div {...styles.fbText}>
      <div {...styles.fbTitle}>
        {data.get('facebookTitle') || data.get('title')}
      </div>
      <div {...styles.fbDescription}>
        {data.get('facebookDescription') || data.get('description')}
      </div>
      <div {...styles.fbDomain}>republik.ch</div>
    </div>
  </div>
)

export default FBPreview
