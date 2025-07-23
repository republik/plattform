import { css } from 'glamor'
import PropTypes from 'prop-types'
import colors from '../../theme/colors'
import zIndex from '../../theme/zIndex'
import { FigureByline, FigureImage } from '../Figure'
import { mUp, tUp } from './mediaQueries'
import Text from './Text'

const styles = {
  container: css({
    position: 'relative',
    lineHeight: 0,
    margin: 0,
    zIndex: zIndex.frontImage,
    display: 'grid',
    [tUp]: {
      background: 'none',
    },
  }),
  textContainer: css({
    overflow: 'hidden', // Hides unpositioned content on mobile.
    padding: '15px 15px 40px 15px',
    [mUp]: {
      padding: '40px 15% 70px 15%',
    },
  }),
  textContainerOnTop: css({
    [tUp]: {
      padding: 0,
    },
  }),
}

const ImageBlock = ({
  children,
  attributes,
  image,
  maxWidth,
  byline,
  alt = '',
  onClick,
  color,
  bgColor,
  textPosition = 'topleft',
  center,
  aboveTheFold,
  onlyImage,
  feuilleton,
  audioPlayButton,
  id,
}) => {
  const background = bgColor || ''
  const isTextOnTop = textPosition !== 'underneath'

  return (
    <div
      id={`teaser-${id}`}
      {...attributes}
      {...(feuilleton ? styles.containerFeuilleton : styles.container)}
      onClick={onClick}
      style={{
        background,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth,
          margin: maxWidth ? '0 auto' : undefined,
        }}
      >
        <div style={{ position: 'relative', fontSize: 0 }}>
          <FigureImage
            aboveTheFold={aboveTheFold}
            {...FigureImage.utils.getResizedSrcs(
              image,
              undefined,
              maxWidth || 1500,
              false,
            )}
            maxWidth={maxWidth}
            alt={alt}
          />
          {byline && (
            <FigureByline
              position={onlyImage ? 'leftInsideOnlyImage' : 'leftInside'}
              style={{ color }}
            >
              {byline}
            </FigureByline>
          )}
        </div>
        {!onlyImage && (
          <div
            {...(feuilleton
              ? styles.textContainerFeuilleton
              : styles.textContainer)}
            {...(isTextOnTop ? styles.textContainerOnTop : undefined)}
          >
            <Text
              position={isTextOnTop ? textPosition : undefined}
              color={color}
              collapsedColor={feuilleton && colors.text}
              center={center}
              feuilleton={feuilleton}
              audioPlayButton={audioPlayButton}
            >
              {children}
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}

ImageBlock.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  image: PropTypes.string.isRequired,
  byline: PropTypes.string,
  alt: PropTypes.string,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  center: PropTypes.bool,
  textPosition: PropTypes.oneOf([
    'topleft',
    'topright',
    'bottomleft',
    'bottomright',
    'top',
    'middle',
    'bottom',
    'underneath',
  ]),
  onlyImage: PropTypes.bool,
  feuilleton: PropTypes.bool,
  shouldRenderPlayButton: PropTypes.node,
}

export default ImageBlock
