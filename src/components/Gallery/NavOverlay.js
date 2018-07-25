import React from 'react'
import PropTypes from 'prop-types'
import ChevronLeft from 'react-icons/lib/md/chevron-left'
import ChevronRight from 'react-icons/lib/md/chevron-right'
import { css } from 'glamor'
import { lUp } from '../../theme/mediaQueries'
import zIndex from '../../theme/zIndex'

const styles = {
  nav: css({
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    width: '100vw',
    height: '100vh',
    color: '#fff',
    zIndex: zIndex.overlay,
    '& .left': {
      justifyContent: 'flex-start',
    },
    '& .right': {
      justifyContent: 'flex-end'
    }
  }),
  navClose: css({
    position: 'fixed',
    width: 120,
    height: 120,
    top: 8,
    right: 8
  }),
  navArea: css({
    display: 'flex',
    alignItems: 'center',
    width: '33.333%',
    height: '100vh',
    padding: '0 30px',
    opacity: 0,
    transition: 'opacity 0.1s linear',
    ':hover': {
      transition: 'opacity 0.5s linear',
      opacity: '0.7'
    }
  }),
  navButton: css({
    color: '#fff',
    display: 'none',
    [lUp]: {
      display: 'block',
    }
  }),
}

class NavOverlay extends React.Component {
  constructor(props) {
    super(props)
    this.ref = null
    this.setRef = ref => this.ref = ref
    const { handleClickLeft, handleClickRight, onClose } = props
    this.handleKeyUp = (event) => {
      switch (event.keyCode) {
        case 37:
          handleClickLeft()
          break;
        case 39:
          handleClickRight()
          break;
        case 27:
          onClose()
          break;
        default:
          break;
      }
    }
  }
  componentDidMount() {
    this.ref && this.ref.focus()
  }
  render() {
    const { handleClickLeft, handleClickRight, onClose, handleClick } = this.props
    return (
      <div
        ref={this.setRef}
        {...styles.nav}
        onKeyUp={this.handleKeyUp}
        tabIndex={-1}
      >
        <div {...styles.navArea} className='left' onClick={handleClickLeft}>
          <div {...styles.navButton}>
            <ChevronLeft size={48} />
          </div>
        </div>
        <div {...styles.navArea} onClick={handleClick}></div>
        <div {...styles.navArea} className='right' onClick={handleClickRight}>
          <div {...styles.navButton}>
            <ChevronRight size={48} />
          </div>
        </div>
        <div {...styles.navClose} onClick={onClose} />
      </div>
    )
  }
}

NavOverlay.propTypes = {
  handleClickLeft: PropTypes.func.isRequired,
  handleClickRight: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default NavOverlay