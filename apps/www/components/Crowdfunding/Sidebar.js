import { Component, useState } from 'react'
import withT from '../../lib/withT'
import compose from 'lodash/flowRight'
import withInNativeApp from '../../lib/withInNativeApp'

import { PackageItem, PackageBuffer } from '../Pledge/Accordion'

import { withStatus, RawStatus } from './Status'

import { css } from 'glamor'

import { HEADER_HEIGHT } from '../constants'
import { SIDEBAR_WIDTH } from './constants'

import { Button, A, mediaQueries } from '@project-r/styleguide'
import Link from 'next/link'

export const minWindowHeight = 400

const styles = {
  container: css({
    paddingTop: 10,
    [mediaQueries.onlyS]: {
      marginBottom: 30,
    },
  }),
  sticky: css({
    display: 'none',
    [mediaQueries.mUp]: {
      display: 'block',
      position: 'fixed',
      zIndex: 1,
      width: SIDEBAR_WIDTH,
      top: HEADER_HEIGHT,
    },
  }),
  button: css({
    marginBottom: 10,
    [mediaQueries.onlyS]: {
      display: 'none',
    },
  }),
  links: css({
    lineHeight: '24px',
    marginTop: 13,
    fontSize: 16,
  }),
  packages: css({
    fontSize: 19,
    lineHeight: '28px',
    marginBottom: 15,
  }),
}

const SidebarInner = (props) => {
  const { t, crowdfunding, title, links, packages, primaryQuery } = props

  const [hover, setHover] = useState()

  return (
    <div {...styles.container}>
      <div {...styles.packages}>{title}</div>
      {packages.map((pack) => {
        return (
          <Link
            key={pack.name}
            href={{
              pathname: '/angebote',
              query: { ...pack.params, package: pack.name },
            }}
            passHref
            legacyBehavior>
            <PackageItem
              t={t}
              crowdfundingName={crowdfunding.name}
              {...pack}
              hover={hover}
              setHover={setHover}
            />
          </Link>
        );
      })}
      <PackageBuffer />
      <div style={{ margin: '20px 0' }}>
        <div {...styles.button}>
          <Link
            href={{
              pathname: '/angebote',
              query: primaryQuery,
            }}
            passHref
            legacyBehavior>
            <Button block primary>
              Mitmachen
            </Button>
          </Link>
        </div>
      </div>
      <div {...styles.links}>
        {links.map((link, i) => (
          <Link key={i} href={link.href} passHref legacyBehavior>
            <A>
              {link.text}
              <br />
            </A>
          </Link>
        ))}
      </div>
    </div>
  );
}

class Sidebar extends Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.onScroll = () => {
      const y = window.pageYOffset
      const height = window.innerHeight
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      const { sticky, setSticky } = this.props

      if (!this.inner) {
        return
      }

      let status = false
      let sidebar = false
      if (y + HEADER_HEIGHT > this.y) {
        status = true
        if (
          !mobile &&
          height - HEADER_HEIGHT > this.innerHeight &&
          height >= minWindowHeight
        ) {
          sidebar = true
        }
      }

      if (sticky.status !== status || sticky.sidebar !== sidebar) {
        setSticky({
          status,
          sidebar,
        })
      }
    }
    this.innerRef = (ref) => {
      this.inner = ref
    }
    this.measure = () => {
      if (this.inner) {
        const rect = this.inner.getBoundingClientRect()

        this.y = window.pageYOffset + rect.top
        this.innerHeight = rect.height

        const right = window.innerWidth - rect.right

        if (right !== this.state.right) {
          this.setState(() => ({
            right,
          }))
        }
      }
      this.onScroll()
    }
  }
  componentDidMount() {
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentDidUpdate() {
    this.measure()
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.measure)
  }
  render() {
    const { right } = this.state
    const {
      sticky,
      t,
      crowdfunding,
      primaryQuery,
      title,
      links,
      packages,
      statusProps,
      inNativeIOSApp,
    } = this.props

    const onChange = (state) => this.setState(() => state)

    if (!crowdfunding) {
      return null
    }

    return (
      <div>
        <RawStatus
          people
          money
          t={t}
          crowdfundingName={crowdfunding.name}
          crowdfunding={crowdfunding}
          {...statusProps}
        />

        {!inNativeIOSApp && (
          <>
            <div
              ref={this.innerRef}
              style={{
                visibility: sticky.sidebar ? 'hidden' : 'visible',
              }}
            >
              <SidebarInner
                title={title}
                links={links}
                packages={packages}
                primaryQuery={primaryQuery}
                t={t}
                crowdfunding={crowdfunding}
                onChange={onChange}
                state={this.state}
              />
            </div>

            {!!sticky.sidebar && (
              <div {...styles.sticky} style={{ right: right }}>
                <SidebarInner
                  title={title}
                  links={links}
                  packages={packages}
                  primaryQuery={primaryQuery}
                  t={t}
                  crowdfunding={crowdfunding}
                  onChange={onChange}
                  state={this.state}
                />
              </div>
            )}
          </>
        )}
      </div>
    )
  }
}

export default compose(withInNativeApp, withStatus, withT)(Sidebar)
