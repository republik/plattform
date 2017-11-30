import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  container: css({
    backgroundColor: '#fff'
  })
}

class DocumentContainer extends Component {
  constructor (props, ...args) {
    super(props, ...args)

    this.subscriptions = []
    this.subscribe = f => this.subscriptions.push(f)
    this.unsubscribe = f => {
      this.subscriptions = this.subscriptions.filter(subscription => subscription !== f)
    }
    this.makeMetaContext = ({meta}) => ({
      meta: {
        ...(meta.toJS ? meta.toJS() : meta),
        subscribe: this.subscribe,
        unsubscribe: this.unsubscribe
      }
    })
    this.state = this.makeMetaContext(props)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.meta !== this.props.meta) {
      this.setState(
        this.makeMetaContext(nextProps),
        () => {
          this.subscriptions.forEach(f => f())
        }
      )
    }
  }
  getChildContext() {
    const { meta } = this.state
    return {
      meta
    }
  }
  render () {
    const { children } = this.props
    return <div {...styles.container}>
      {children}
    </div>
  }
}

DocumentContainer.childContextTypes = {
  meta: PropTypes.object
}

export default DocumentContainer

const getComponentDisplayName = Component =>
  Component.displayName || Component.name || 'Unknown'

export const withMeta = ComposedComponent => {
  class WithMeta extends Component {
    constructor (...args) {
      super(...args)

      this.subscription = () => this.forceUpdate()
    }
    componentDidMount () {
      this.context.meta.subscribe(this.subscription)
    }
    componentWillUnmount () {
      this.context.meta.unsubscribe(this.subscription)
    }
    render () {
      const { meta } = this.context
      return <ComposedComponent meta={meta} {...this.props} />
    }
  }
  WithMeta.displayName = `WithMeta(${getComponentDisplayName(
    ComposedComponent
  )})`
  WithMeta.contextTypes = {
    meta: PropTypes.object
  }
  return WithMeta
}
