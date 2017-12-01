import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, dUp } from './mediaQueries'
import Image from '../Figure/Image'
import Text from './Text'

const styles = {
  container: css({
    margin: 0,
    [mUp]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8% 5%'
    }
  }),
  containerPortrait: css({
    [mUp]: {
      padding: 0
    }
  }),
  content: css({
    padding: '15px 15px 45px 15px',
    [mUp]: {
      padding: '0 0 0 5%',
      width: '50%'
    }
  }),
  contentReverse: css({
    [mUp]: {
      padding: '0 5% 0 0'
    }
  }),
  contentPortrait: css({
    padding: '15px 15px 45px 15px',
    [mUp]: {
      padding: '5%',
      width: '60%',
    },
    [dUp]: {
      padding: '5% 5% 5% 10%'
    }
  }),
  imageContainer: css({
    [mUp]: {
      flexShrink: 0,
      fontSize: 0, // Removes the small flexbox space.
      height: 'auto',
      width: '50%'
    }
  }),
  imageContainerPortrait: css({
    [mUp]: {
      width: '40%',
      padding: 0
    }
  }),
  image: css({
    height: 'auto',
    maxWidth: '100%'
  })
}

const Split = ({
  children,
  attributes,
  image,
  alt,
  color,
  bgColor,
  center,
  reverse,
  portrait
}) => {
  const background = bgColor || ''
  const flexDirection = reverse ? 'row-reverse' : ''
  return (
    <div
      {...attributes}
      {...css(styles.container, portrait ? styles.containerPortrait : {})}
      style={{ background, flexDirection }}
    >
      <div
        {...css(
          styles.imageContainer,
          portrait ? styles.imageContainerPortrait : {}
        )}
      >
        <Image src={image} alt={alt} />
      </div>
      <div
        {...css(
          styles.content,
          portrait
            ? styles.contentPortrait
            : reverse ? styles.contentReverse : {}
        )}
      >
        <Text color={color} center={center}>
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
  alt: PropTypes.string,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  center: PropTypes.bool,
  reverse: PropTypes.bool
}

Split.defaultProps = {
  alt: ''
}

export default Split
