import React from 'react'
import PropTypes from 'prop-types'
import { Editorial } from '../Typography'
import { Figure } from '../Figure'
import Image from '../Figure/Image'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  container: {
    [mUp]: {
      display: 'flex'
    }
  },
  quoteContainer: css({
    flex: 1
  }),
  imageContainer: css({
    margin: '0 0 15px 0',
    [mUp]: {
      margin: '0 15px 15px 0',
      width: '155px'
    }
  })
}

const PullQuote = ({
  children,
  attributes,
  source,
  isQuoted = true,
  textAlign = 'inherit',
  maxWidth,
  imageSrc,
  ...props
}) => {
  let containerStyle = { ...styles.container, textAlign: textAlign }
  if (textAlign === 'center') {
    containerStyle.margin = '0 auto'
  }
  if (maxWidth) {
    containerStyle.maxWidth = maxWidth
  }

  return (
    <blockquote {...attributes} {...css(containerStyle)}>
      {imageSrc && (
        <div {...styles.imageContainer}>
          <Figure>
            <Image src={imageSrc} alt="" />
          </Figure>
        </div>
      )}
      <div {...styles.quoteContainer}>
        <Editorial.QuoteText>
          {isQuoted ? <span>«{children}»</span> : <span>{children}</span>}
        </Editorial.QuoteText>
        {!!source && <Editorial.Cite>{source}</Editorial.Cite>}
      </div>
    </blockquote>
  )
}


PullQuote.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  source: PropTypes.string,
  isQuoted: PropTypes.bool,
  textAlign: PropTypes.oneOf(['inherit', 'left', 'center', 'right']),
  maxWidth: PropTypes.string,
  imageSrc: PropTypes.string,
}

export default PullQuote
