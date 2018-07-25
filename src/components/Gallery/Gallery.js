import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { onlyS } from '../../theme/mediaQueries'
import debounce from 'lodash.debounce'
import Spinner from '../Spinner'
import zIndex from '../../theme/zIndex'

import Swipeable from 'react-swipeable'
import Close from 'react-icons/lib/md/close'
import { FigureImage, FigureCaption, FigureByline } from '../Figure'
import NavOverlay from './NavOverlay'

const fadeInDurationMs = 200
const fadeIn = css.keyframes({
  '0%': {opacity: 0,},
  '100%': {opacity: 1}
})

const swipeAnimationDurationMs = 200
const swipeAnimation = (side = 'top') => {
  const kfrms = css.keyframes({
    '0%': {opacity: 1, [side]: 0},
    '100%': {opacity: 0, [side]: 60}
  })
  return `${kfrms} ${swipeAnimationDurationMs}ms ease-out`
}

const styles = {
  wrapper: css({
    position: 'fixed',
    top:0,
    right: 0,
    bottom:0,
    left:0,  
    zIndex: zIndex.foreground  
  }),
  gallery: css({
    width: '100vw',
    height: '100vh',
    color: '#fff',
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    animation: `${fadeIn} ${fadeInDurationMs}ms ease-out`
  }),
  header: css({
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    transition: 'opacity 0.1s ease-in',
    padding: '30px 70px',
    [onlyS]: {
      padding: 15,
    }
    }),
  body: css({
    display: 'flex',
    flex: '1 1 auto',
  }),
  counter: css({
    flex: 1,
  }),
  close: css({
    position: 'absolute',
    flex: 1,
    right: 68,
    top: 28,
    [onlyS]: {
      right: 13,
      top: 13,
    }
  }),
  media: css({
    height: '100px',
  }),
  caption: css({
    flex: '0 0 auto',
    padding: '15px 70px',
    transition: 'opacity 0.1s ease-in',
    [onlyS]: {
      padding: 15,
    }
  }),
  mediaItem: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    flex: 1,
    flexGrow: 1,
    opacity: 1
  }),
  mediaItemImage: css({
    flex: '0 0 auto',
    verticalAlign: 'bottom',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    margin: 'auto',
    animation: `${fadeIn} ${fadeInDurationMs}ms ease-out`,
  }),
  closing: css({
    animation: swipeAnimation('top'),
  }),
  exitLeft: css({
    animation: swipeAnimation('right'),
  }),
  exitRight: css({
    animation: swipeAnimation('left'),
  }),
}

const removeQuery = (url = '') => url.split('?')[0]

class Gallery extends Component {
  constructor(props) {
    super(props)
    const startItemIndex = props.items.findIndex(
      i => removeQuery(i.src) === removeQuery(props.startItemSrc)
    )
    this.state = {
      index: startItemIndex > -1 ? startItemIndex : 0,
      focus: false,
    }

    this.handleClickLeft = () => {
      const total = this.props.items.length
      this.setState(prevState => ({
        index: prevState.index !== 0 ? (prevState.index - 1) : (total - 1),
        exitLeft: false,
        exitRight: false,
      }))
    }

    this.handleClickRight = () => {
      const total = this.props.items.length - 1
      this.setState(prevState => ({
        index: prevState.index !== total ? (prevState.index + 1) : 0,
        exitLeft: false,
        exitRight: false,
      }))
    }

    this.toggleFocus = () => {
      this.setState(prevState => ({ focus: !prevState.focus }))
    }

    this.handleSwipeDown = () =>
      this.setState(
        {closing: true},
        debounce(props.onClose, swipeAnimationDurationMs)
      )

    this.handleSwipeLeft = () =>
      this.setState(
        {exitLeft: true},
        debounce(this.handleClickRight, swipeAnimationDurationMs * 0.7)
      )

    this.handleSwipeRight = () =>
      this.setState(
        {exitRight: true},
        debounce(this.handleClickLeft, swipeAnimationDurationMs * 0.7)
      )

  }

  render() {
    const { index, exitLeft, exitRight, closing, focus } = this.state
    const { onClose, items } = this.props
    const { src, caption, credit, alt } = items[index]
    const total = this.props.items.length
    const srcs = FigureImage.utils.getResizedSrcs(src, window.innerWidth)
    return (
      <div {...styles.wrapper}>
        <Swipeable
          onSwipedDown={this.handleSwipeDown}
          onSwipedLeft={this.handleSwipeLeft}
          onSwipedRight={this.handleSwipeRight}
          delta={10}
          preventDefaultTouchmoveEvent={true}
          stopPropagation={true}
        >
          <NavOverlay
            handleClickLeft={this.handleClickLeft}
            handleClickRight={this.handleClickRight}
            handleClick={this.toggleFocus}
            onClose={onClose}
          />
          <div {...styles.gallery}>
            <div {...styles.header} style={{ opacity: focus ? 0 : 1 }}>
              <div {...styles.counter}>
                {index+1}/{total}
              </div>
              <div {...styles.close} onClick={onClose}>
                <Close size={24} />
              </div>
            </div>
            <div {...styles.body}>
              <div
                {...styles.mediaItem}
                {...(exitLeft && styles.exitLeft)}
                {...(exitRight && styles.exitRight)}
                {...(closing && styles.closing)}
              >
                <Spinner />
                <img key={src} alt={alt} {...styles.mediaItemImage} {...srcs} />
              </div>
            </div>
            <div {...styles.caption} style={{ opacity: focus ? 0 : 1 }}>
              <FigureCaption>
                { `${caption} ` }
                { credit && <FigureByline>{ credit }</FigureByline> }
              </FigureCaption>
            </div>
          </div>
        </Swipeable>
      </div>
    )
  }
}

Gallery.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    caption: PropTypes.string,
    credit: PropTypes.string
  })),
  startItemSrc: PropTypes.string,
  onClose: PropTypes.func.isRequired
}

Gallery.defaultProps = {
  items: [],
}

export default Gallery
