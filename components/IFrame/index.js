import React, { Component } from 'react'
import { styleSheet } from 'glamor'
import Frame from 'react-frame-component'
import PropTypes from 'prop-types'
import createDebug from 'debug'

const debug = createDebug('publikator:iframe')

class IFrame extends Component {
  constructor(...args) {
    super(...args)

    this.state = {
      css: ''
    }
    this.containerRef = ref => {
      this.container = ref
    }

    this.measure = () => {
      this.setState(() => ({
        width: this.container && this.container.getBoundingClientRect().width
      }))
    }
  }
  componentDidMount() {
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.measure)
  }
  transferCSS() {
    const css = styleSheet
      .rules()
      .map(r => r.cssText)
      .join('')
    if (css !== this.state.css) {
      debug('transfer css', { css })
      this.setState({
        css
      })
    }
  }
  render() {
    const { size, style, children } = this.props
    const { width, css } = this.state

    const scale = width ? Math.min(1, width / size.width) : 1

    return (
      <div ref={this.containerRef}>
        <div
          style={{
            width: size.width,
            transformOrigin: '0% 0%',
            transform: `scale(${scale})`,
            ...style
          }}
        >
          <Frame
            frameBorder='0'
            contentDidMount={() => this.transferCSS()}
            contentDidUpdate={() => this.transferCSS()}
            head={[<style key='glamor'>{css}</style>]}
            style={{
              width: '100%',
              height: size.height
            }}
          >
            {children}
          </Frame>
        </div>
      </div>
    )
  }
}

IFrame.propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }).isRequired
}

export default IFrame
