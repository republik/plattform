import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from './mediaQueries'
import { FigureImage, FigureByline } from '../Figure'
import Text from './Text'

const styles = {
  container: css({
    margin: 0,
    overflow: 'hidden',
    position: 'relative',
    gridTemplateAreas: '"image content"',
    gridTemplateColumns: '50% 1fr',
    gap: '5%',
    alignItems: 'center',
    justifyContent: 'center',
    [mUp]: {
      display: 'grid',
      padding: '70px 5%',
    },
  }),
  containerReverse: css({
    gridTemplateAreas: '"content image"',
    gridTemplateColumns: '1fr 50%',
  }),
  containerPortrait: css({
    gridTemplateAreas: '"image content empty"',
    gridTemplateColumns: '40% 1fr 0',
    alignItems: 'start',
    [mUp]: {
      padding: 0,
    },
  }),
  containerPortraitReverse: css({
    gridTemplateAreas: '"empty content image"',
    gridTemplateColumns: '0 1fr 40%',
  }),
  content: css({
    gridArea: 'content',
    padding: '15px 15px 40px 15px',
    [mUp]: {
      padding: 0,
    },
  }),
  contentPortrait: css({
    [mUp]: {
      padding: '40px 0',
    },
  }),
  imageContainer: css({
    gridArea: 'image',
    position: 'relative',
  }),
}

const Split = ({
  children,
  attributes,
  image,
  byline,
  alt,
  onClick,
  color,
  bgColor,
  center,
  reverse,
  portrait,
  aboveTheFold,
  feuilleton,
  audioPlayButton,
}) => {
  const background = bgColor
  const bylinePosition = feuilleton
    ? 'belowFeuilleton'
    : portrait
    ? reverse
      ? 'left'
      : 'right'
    : 'below'
  return (
    <div
      {...attributes}
      {...css(
        styles.container,
        reverse && styles.containerReverse,
        portrait && styles.containerPortrait,
        reverse && portrait && styles.containerPortraitReverse,
      )}
      onClick={onClick}
      style={{
        background,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div {...styles.imageContainer}>
        <FigureImage
          aboveTheFold={aboveTheFold}
          {...FigureImage.utils.getResizedSrcs(image, undefined, 750)}
          alt={alt}
        />
        {byline && (
          <FigureByline position={bylinePosition} style={{ color }}>
            {byline}
          </FigureByline>
        )}
      </div>
      <div {...css(styles.content, portrait && styles.contentPortrait)}>
        <Text
          color={color}
          center={center}
          feuilleton={feuilleton}
          audioPlayButton={audioPlayButton}
        >
          {children}
        </Text>
      </div>
    </div>
  )
}

Split.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  image: PropTypes.string.isRequired,
  byline: PropTypes.string,
  alt: PropTypes.string,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  center: PropTypes.bool,
  reverse: PropTypes.bool,
  audioPlayButton: PropTypes.node,
}

export default Split
