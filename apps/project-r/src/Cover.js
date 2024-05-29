import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

const mqMedium = '@media (min-width: 600px)'
const mqLarge = '@media (min-width: 900px)'
const coverStyle = css({
  width: '100%',
  position: 'relative',
  [mqLarge]: {
    minHeight: 500,
    height: ['700px', '80vh'],
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})
const coverImageStyle = css({
  display: 'block',
  [mqLarge]: {
    display: 'none'
  }
})
const creditStyle = css({
  position: 'absolute',
  fontSize: 10,
  fontFamily: 'sans-serif',
  color: '#000',
  right: 10,
  top: 5,
  [mqMedium]: {
    color: '#fff',
    top: 'auto',
    bottom: 10
  }
})

const leadStyle = css({
  '& p': {
    fontWeight: 'bold'
  },
  '& p:last-child': {
    margin: 0
  },
  position: 'relative',
  [mqMedium]: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    color: '#fff',
    backgroundImage: 'linear-gradient(-180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.80) 100%)'
  }
})
const leadContainerStyle = css({
  [mqMedium]: {
    position: 'absolute',
    bottom: '15%',
    left: 0,
    right: 0
  }
})
const leadCenterStyle = css({
  padding: '20px 20px 0',
  [mqMedium]: {
    textAlign: 'center',
    maxWidth: 640,
    margin: '0 auto'
  }
})

const Cover = ({image, children}) => (
  <div
    {...coverStyle}
    {...css({[mqLarge]: {backgroundImage: `url('${image.src}')`}})}>
    <img {...coverImageStyle} src={image.src} alt={image.alt} />
    <div {...leadStyle}>
      <div {...leadContainerStyle}>
        <div {...leadCenterStyle}>
          {children}
        </div>
      </div>
      {!!image.credit && <div {...creditStyle}>{image.credit}</div>}
    </div>
  </div>
)

Cover.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.node
}

export default Cover
