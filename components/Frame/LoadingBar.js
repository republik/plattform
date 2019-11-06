import React, { Component } from 'react'
import Router from 'next/router'

import { css } from 'glamor'
import { colors } from '@project-r/styleguide'
import { ZINDEX_LOADINGBAR } from './constants'

const styles = {
  loadingBar: css({
    position: 'fixed',
    zIndex: ZINDEX_LOADINGBAR,
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: colors.primary,
    transition: 'width 200ms linear, opacity 200ms linear'
  })
}

class LoadingBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      progress: 0
    }
  }
  onRouteChangeStart = url => {
    clearTimeout(this.timeout)
    this.setState({ loading: true, progress: 0.02 })

    const { onRouteChangeStart } = this.props
    if (onRouteChangeStart) {
      onRouteChangeStart(url)
    }
  }
  onRouteChangeComplete = url => {
    clearTimeout(this.timeout)
    this.setState({ loading: false })
  }
  onRouteChangeError = () => {
    clearTimeout(this.timeout)
    this.setState({ loading: false })
  }
  componentDidMount() {
    Router.events.on('routeChangeStart', this.onRouteChangeStart)
    Router.events.on('routeChangeComplete', this.onRouteChangeComplete)
    Router.events.on('routeChangeError', this.onRouteChangeError)
  }
  componentWillUnmount() {
    clearTimeout(this.timeout)
    Router.events.off('routeChangeStart', this.onRouteChangeStart)
    Router.events.off('routeChangeComplete', this.onRouteChangeComplete)
    Router.events.off('routeChangeError', this.onRouteChangeError)
  }
  componentDidUpdate() {
    if (this.state.loading) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.setState(({ progress }) => {
          let amount = 0
          if (progress >= 0 && progress < 0.2) {
            amount = 0.1
          } else if (progress >= 0.2 && progress < 0.5) {
            amount = 0.04
          } else if (progress >= 0.5 && progress < 0.8) {
            amount = 0.02
          } else if (progress >= 0.8 && progress < 0.99) {
            amount = 0.005
          }
          return {
            progress: progress + amount
          }
        })
      }, 200)
    }
  }
  render() {
    const { loading, progress } = this.state
    return (
      <div
        {...styles.loadingBar}
        style={{
          opacity: loading ? 1 : 0,
          width: `${progress * 100}%`
        }}
      />
    )
  }
}

export default LoadingBar
