import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, dUp } from './mediaQueries'
import { FigureImage, FigureByline } from '../Figure'
import Text from './Text'

const styles = {
  container: css({
    margin: 0,
    overflow: 'hidden',
    position: 'relative',
    [mUp]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '70px 5%',
    },
  }),
  containerPortrait: css({
    [mUp]: {
      padding: 0,
      alignItems: 'flex-start',
    },
  }),
  content: css({
    padding: '15px 15px 40px 15px',
    [mUp]: {
      padding: '0 0 0 5%',
      width: '50%',
    },
  }),
  contentReverse: css({
    [mUp]: {
      padding: '0 5% 0 0',
    },
  }),
  contentPortrait: css({
    padding: '15px 15px 40px 15px',
    [mUp]: {
      padding: '40px 5%',
      width: '60%',
    },
    [dUp]: {
      padding: '40px 5%',
    },
  }),
  imageContainer: css({
    position: 'relative',
    [mUp]: {
      flexShrink: 0,
      fontSize: 0, // Removes the small flexbox space.
      height: 'auto',
      width: '50%',
    },
  }),
  imageContainerFeuilleton: css({
    padding: '15px 15px 0 15px',
    position: 'relative',
    [mUp]: {
      padding: 0,
      flexShrink: 0,
      fontSize: 0, // Removes the small flexbox space.
      height: 'auto',
      width: '50%',
    },
  }),
  imageContainerPortrait: css({
    [mUp]: {
      width: '40%',
      padding: 0,
    },
  }),
  image: css({
    height: 'auto',
    maxWidth: '100%',
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
  const flexDirection = reverse ? 'row-reverse' : undefined
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
      {...css(styles.container, portrait ? styles.containerPortrait : {})}
      onClick={onClick}
      style={{
        position: 'relative',
        background,
        flexDirection,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        {...css(
          styles.imageContainer,
          portrait ? styles.imageContainerPortrait : {},
        )}
      >
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
      <div
        {...css(
          styles.content,
          portrait
            ? styles.contentPortrait
            : reverse
            ? styles.contentReverse
            : {},
        )}
      >
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
