import { Component } from 'react'
import Router from 'next/router'

import { parse, format } from 'url'

import withMe from '../lib/withMe'
import track from '../lib/piwik'

import { PUBLIC_BASE_URL } from '../lib/settings'

const trackRoles = me =>
  track([
    'setCustomDimension',
    1,
    me
      ? []
          .concat(me.roles)
          .sort()
          .join(' ') || 'none'
      : 'guest'
  ])

const trackPageView = url => {
  // sanitize url
  const urlObject = parse(url, true)
  const { query } = urlObject

  // Redact email and token for notification, pledge and sign in pages
  if (query.email) {
    query.email = 'R'
  }
  if (query.token) {
    query.token = 'R'
  }
  // ensure query string is calculated from query object
  urlObject.search = undefined

  const sanitizedUrl = format(urlObject)

  track(['setCustomUrl', sanitizedUrl])
  track(['setDocumentTitle', document.title])
  track(['trackPageView'])
}

class Track extends Component {
  componentDidMount() {
    trackRoles(this.props.me)
    trackPageView(window.location.href)
    Router.events.on('routeChangeComplete', this.onRouteChangeComplete)
  }
  onRouteChangeComplete = url => {
    // give pages time to set correct page title
    // may not always be enough, e.g. if data dependent and slow query/network, but works fine for many cases
    setTimeout(() => {
      // update url and title manually, necessary after client navigation
      trackPageView(`${PUBLIC_BASE_URL}${url}`)
    }, 600)
  }
  componentWillUnmount() {
    Router.events.off('routeChangeComplete', this.onRouteChangeComplete)
  }
  UNSAFE_componentWillReceiveProps({ me }) {
    if (
      me !== this.props.me &&
      (!me || !this.props.me || me.email !== this.props.me.email)
    ) {
      // start new visit with potentially different roles
      track(['appendToTrackingUrl', 'new_visit=1'])
      track(['deleteCookies'])
      trackRoles(me)
    }
  }
  render() {
    return null
  }
}

export default withMe(Track)
