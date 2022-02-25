import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
import { scrollTop } from '../../lib/utils/link'
import { withRouter } from 'next/router'

const hasAncestor = (node, predicate) => {
  if (predicate(node)) {
    return true
  }
  if (node.parentNode) {
    return hasAncestor(node.parentNode, predicate)
  }
  return false
}

class AreaLink extends Component {
  constructor(props, ...rest) {
    super(props, ...rest)
    this.linkClicked = this.linkClicked.bind(this)
  }
  linkClicked(e) {
    if (hasAncestor(e.target, (node) => node.nodeName === 'A')) {
      // ignore click for specific links
      // the area link links areas that are not part of an A tag
      return
    }

    const { router, href } = this.props

    // If the user presses the meta-key (to handle MacOS) or
    // the ctrl-key (in case of all other OS) open the link in a new tab to
    // properly emulate the expected link behaviour.
    if (e.metaKey || e.ctrlKey) {
      window.open(href, '_blank')
      return
    }

    router
      .push(href)
      .then((success) => {
        if (!success) return
        scrollTop()
        document.body.focus()
      })
      .catch((err) => {
        if (this.props.onError) this.props.onError(err)
      })
  }
  render() {
    const { children, passHref } = this.props
    const child = Children.only(children)
    if (passHref) {
      throw new Error('Area links never pass href')
    }

    const props = {
      onClick: this.linkClicked,
    }

    return React.cloneElement(child, props)
  }
}

AreaLink.propTypes = {
  children: PropTypes.element.isRequired,
  href: PropTypes.string.isRequired,
}

export default withRouter(AreaLink)
