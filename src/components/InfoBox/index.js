import React from 'react'
import PropTypes from 'prop-types'
import { Editorial } from '../Typography'
import { Figure } from '../Figure'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const imageContainerStyles = {
  floated: {
    float: 'left',
    margin: '10px 15px 5px 0',
    width: '99px'
  },
  absolute: {
    position: 'absolute',
    left: 0,
    margin: '0 15px 15px 0',
    top: 0
  }
}

const styles = {
  container: {
    position: 'relative'
  },
  imageContainer: css({
    ...imageContainerStyles.floated,
    [mUp]: {
      ...imageContainerStyles.absolute
    }
  }),
  image: css({
    maxWidth: '100%'
  })
}

const IMAGE_SIZE = {
  S: 155,
  M: 240,
  L: 325
}

const InfoBox = ({
  children,
  attributes,
  title,
  imageSrc,
  imageSize = 'S',
  byline,
  float = false,
  ...props
}) => {
  let containerStyle = { ...styles.container }
  const wrapperStyle = css(
    imageSrc && !float
      ? {
          [mUp]: {
            marginLeft: `${IMAGE_SIZE[imageSize] + 20}px`
          }
        }
      : {}
  )
  const imageWidth = { [mUp]: { width: `${IMAGE_SIZE[imageSize]}px` } }
  const imageContainerStyle = css(
    imageSrc && float ? imageContainerStyles.floated : styles.imageContainer,
    imageWidth
  )
  return (
    <section {...attributes} {...css(containerStyle)}>
      <div {...wrapperStyle}>
        <Editorial.BoxTitle>{title}</Editorial.BoxTitle>
      </div>
      {imageSrc && (
        <div {...imageContainerStyle}>
          <Figure>
            <img {...styles.image} src={imageSrc} alt="" />
            {byline && (
              <Editorial.Caption>
                <Editorial.Byline>{byline}</Editorial.Byline>
              </Editorial.Caption>
            )}
          </Figure>
        </div>
      )}
      <div {...wrapperStyle}>
        <Editorial.BoxText>{children}</Editorial.BoxText>
      </div>
    </section>
  )
}

InfoBox.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  title: PropTypes.string.isRequired,
  imageSrc: PropTypes.string,
  imageSize: PropTypes.oneOf(['S', 'M', 'L']),
  byline: PropTypes.string,
  float: PropTypes.bool
}

export default InfoBox
