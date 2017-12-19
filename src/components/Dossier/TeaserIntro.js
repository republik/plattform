import React from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { FigureImage } from '../Figure'
import Tag from './Tag'

const styles = {
  container: css({
    margin: 0,
    [mUp]: {
      marginBottom: '40px'
    }
  }),
  containerWithImage: css({
    [mUp]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }),
  content: css({
    padding: '15px 15px 45px 15px',
    [mUp]: {
      padding: 0,
      width: '50%'
    }
  }),
  contentWithImage: css({
    [mUp]: {
      padding: '0 0 0 5%',
      width: '60%'
    }
  }),
  imageContainer: css({
    [mUp]: {
      flexShrink: 0,
      fontSize: 0, // Removes the small flexbox space.
      height: 'auto',
      width: '40%'
    }
  }),
  image: css({
    height: 'auto',
    maxWidth: '100%'
  })
}

const TeaserIntro = ({ children, attributes, image, alt, onClick, t }) => {
  return (
    <div
      {...attributes}
      {...merge(styles.container, image ? styles.containerWithImage : {})}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {image && <div {...styles.imageContainer}>
        <FigureImage
          {...FigureImage.utils.getResizedSrcs(image, 750)}
          alt={alt}
        />
      </div>}
      <div {...merge(styles.content, image ? styles.contentWithImage : {})}>
        <Tag t={t} />
        {children}
      </div>
    </div>
  )
}
TeaserIntro.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  image: PropTypes.string,
  alt: PropTypes.string,
  onClick: PropTypes.func
}

TeaserIntro.defaultProps = {
  alt: ''
}

export default TeaserIntro
