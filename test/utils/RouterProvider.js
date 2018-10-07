import React from 'react'
import PropTypes from 'prop-types'

class RouterProvider extends React.Component {
  getChildContext () {
    return {
      router: this.props.router
    }
  }
  render () {
    return this.props.children
  }
}

RouterProvider.childContextTypes = {
  router: PropTypes.object.isRequired
}

RouterProvider.propTypes = {
  router: PropTypes.object.isRequired
}

export default RouterProvider
