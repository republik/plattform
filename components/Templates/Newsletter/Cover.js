import React from 'react'
import { css } from 'glamor'

import { mq } from './styles'
import { imageResizeUrl } from '../utils'

const styles = {
  cover: {
    width: '100%',
    position: 'relative',
    [mq.large]: {
      minHeight: 500,
      height: ['700px', '80vh'],
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  },
  coverImage: {
    display: 'block',
    width: '100%',
    [mq.large]: {
      display: 'none'
    }
  },
  coverLead: {
    position: 'relative',
    [mq.medium]: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
      color: '#fff',
      backgroundImage: 'linear-gradient(-180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.80) 100%)'
    }
  },
  coverLeadContainer: {
    [mq.medium]: {
      position: 'absolute',
      zIndex: 1000,
      bottom: '15%',
      left: 0,
      right: 0
    }
  },
  coverLeadCenter: {
    padding: '20px 20px 0',
    [mq.medium]: {
      textAlign: 'center',
      maxWidth: 640,
      margin: '0 auto'
    }
  },
  lead: {
    fontWeight: 'bold',
    margin: 0,
    position: 'relative'
  },
  title: {
    position: 'relative',
    fontSize: 36,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    lineHeight: '1.2em',
    margin: '0 0 0.2em'
  }
}

export const Lead = ({children, attributes = {}}) => (
  <div {...css(styles.lead)} {...attributes}>
    {children}
  </div>
)

export const Title = ({children, attributes = {}}) => (
  <h1 {...css(styles.title)} {...attributes}>
    {children}
  </h1>
)

export default ({ data: { src, alt }, children, attributes = {} }) => {
  const src2000 = imageResizeUrl(src, '2000x')

  return <div
    {...css(styles.cover)}
    {...css({ [mq.large]: { backgroundImage: `url('${src2000}')` } })}
    {...attributes}
    >
    <img
      src={src2000}
      alt={alt}
      {...css(styles.coverImage)}
    />
    <div {...css(styles.coverLead)}>
      <div {...css(styles.coverLeadContainer)}>
        <div {...css(styles.coverLeadCenter)}>
          {children}
        </div>
      </div>
    </div>
  </div>
}
