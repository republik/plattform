// Based on github.com/sconstantinides/react-pullable
// License MIT
// Author Stelios Constantinides <sconstantinides@gmail.com>

import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import {
  InlineSpinner,
  isBodyScrollLocked,
  useColorContext,
} from '@project-r/styleguide'
import { IconArrowDownward } from '@republik/icons'

const styles = {
  container: css({
    display: 'flex',
    overflow: 'hidden',
    justifyContent: 'center',
    pointerEvents: 'none',
    alignItems: 'center',
  }),
}

const Container = (props) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('backgroundColor', 'hover')}
      {...styles.container}
      {...(props.shouldReset
        ? css({
            transition: `height ${props.resetDuration}ms ${props.resetEase}`,
          })
        : undefined)}
      style={{
        height: props.height,
      }}
    >
      {props.children}
    </div>
  )
}

class Pullable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      status: 'ready',
      height: 0,
    }

    this.clearTouchStatus = () => {
      this.pullStartY = null
      this.pullMoveY = null
      this.dist = 0
      this.distResisted = 0
      this.ignoreTouches = false
    }
    this.clearTouchStatus()

    this.onTouchStart = (e) => {
      if (this.props.disabled || this.ignoreTouches) return

      if (this.state.status === 'ready' && this.props.shouldPullToRefresh()) {
        this.pullStartY = e.touches[0].screenY
      } else {
        this.pullStartY = null
      }
    }

    this.onTouchMove = (e) => {
      if (this.props.disabled || this.ignoreTouches || this.pullStartY === null)
        return

      this.pullMoveY = e.touches[0].screenY
      this.dist = this.pullMoveY - this.pullStartY

      if (this.dist > 0) {
        e.preventDefault()

        this.distResisted = Math.min(
          this.dist / this.props.resistance,
          this.props.distThreshold,
        )

        this.setState(
          {
            status: 'pulling',
            height: this.distResisted,
          },
          () => {
            if (this.distResisted === this.props.distThreshold) this.refresh()
          },
        )
      }
    }

    this.onTouchEnd = () => {
      if (this.props.disabled || this.ignoreTouches) return

      if (this.state.status === 'pulling') {
        this.ignoreTouches = true
        this.setState({ status: 'pullAborted', height: 0 }, () => {
          this.reset(this.props.resetDuration)
        })
      } else {
        this.reset()
      }
    }

    this.refresh = () => {
      this.ignoreTouches = true
      this.setState({ status: 'refreshing' }, () => {
        this.props.onRefresh()

        this.refreshCompletedTimeout = setTimeout(() => {
          this.setState({ status: 'refreshCompleted', height: 0 }, () => {
            this.reset(this.props.resetDuration)
          })
        }, this.props.refreshDuration)
      })
    }

    this.reset = (delay = 0) => {
      this.resetTimeout = setTimeout(() => {
        this.clearTouchStatus()
        this.setState({ status: 'ready' })
      }, delay)
    }
  }

  componentDidMount() {
    window.addEventListener('touchstart', this.onTouchStart)
    window.addEventListener('touchmove', this.onTouchMove, { passive: false })
    window.addEventListener('touchend', this.onTouchEnd)
  }

  componentWillUnmount() {
    window.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('touchmove', this.onTouchMove, {
      passive: false,
    })
    window.removeEventListener('touchend', this.onTouchEnd)

    clearTimeout(this.refreshCompletedTimeout)
    clearTimeout(this.resetTimeout)
  }

  render() {
    const { status, height } = this.state
    const shouldSpin = status === 'refreshing' || status === 'refreshCompleted'
    const shouldReset =
      status === 'pullAborted' || status === 'refreshCompleted'

    return (
      <Fragment>
        <Container
          height={height}
          resetDuration={this.props.resetDuration}
          resetEase={this.props.resetEase}
          shouldReset={shouldReset}
          dark={this.props.dark}
        >
          {shouldSpin ? (
            <InlineSpinner size={32} />
          ) : (
            <IconArrowDownward size={32} />
          )}
        </Container>
        {this.props.children}
      </Fragment>
    )
  }
}

Pullable.defaultProps = {
  distThreshold: 72,
  resistance: 2.5,
  refreshDuration: 1000,
  resetDuration: 400,
  resetEase: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  shouldPullToRefresh: () => window.scrollY <= 0 && !isBodyScrollLocked(),
  disabled: false,
}

Pullable.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  distThreshold: PropTypes.number,
  resistance: PropTypes.number,
  refreshDuration: PropTypes.number,
  resetDuration: PropTypes.number,
  resetEase: PropTypes.string,
  shouldPullToRefresh: PropTypes.func,
  disabled: PropTypes.bool,
}

export default Pullable
