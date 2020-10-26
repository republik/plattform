import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as glamor from 'glamor'
import * as styleguide from '../../lib.js'
import * as styleguideChart from '../../chart.js'

import { requireFrom } from './require'
import Loader from '../Loader'

import SG from '../../theme/env'

const DEFAULT_ALLOW_LIST = (SG.DYNAMIC_COMPONENT_BASE_URLS || '')
  .split(',')
  .filter(Boolean)

export const createRequire = (allowList = DEFAULT_ALLOW_LIST) => {
  const allowed = ['/', './'].concat(allowList)
  return requireFrom(name => {
    if (allowed.some(base => name.startsWith(base))) {
      return name
    }
    return `./${name}`
  }).alias({
    react: React,
    'prop-types': PropTypes,
    glamor,
    '@project-r/styleguide': styleguide,
    '@project-r/styleguide/chart': styleguideChart
  })
}

class DynamicComponent extends Component {
  constructor(...args) {
    super(...args)

    this.state = {}
  }
  componentDidMount() {
    if (this.props.src) {
      this.props
        .require(this.props.src)
        .then(module => {
          this.setState({
            LoadedComponent: module.hasOwnProperty('default')
              ? module['default']
              : module
          })
        })
        .catch(error => {
          this.setState({ error })
        })
    }
  }
  render() {
    const { LoadedComponent } = this.state
    const IdentifierComponent = !this.props.src && this.props.identifiers[this.props.identifier]
    const error =
      this.state.error ||
      (!this.props.src &&
        !IdentifierComponent &&
        new Error('Missing src or identifier'))
    if (error) {
      throw error
    }

    const DisplayComponent = LoadedComponent || IdentifierComponent

    if (DisplayComponent) {
      return (
        <DisplayComponent require={this.props.require} identifier={this.props.identifier} {...this.props.props} />
      )
    }

    const { html, loaderProps } = this.props
    if (html) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: html
          }}
        />
      )
    }
    return <Loader {...loaderProps} loading />
  }
}

DynamicComponent.propTypes = {
  src: PropTypes.string,
  identifier: PropTypes.string,
  html: PropTypes.string,
  props: PropTypes.object,
  loaderProps: PropTypes.object,
  require: PropTypes.func.isRequired,
  identifiers: PropTypes.object.isRequired
}

DynamicComponent.defaultProps = {
  require: createRequire(),
  identifiers: {}
}

export default DynamicComponent
