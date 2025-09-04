import React from 'react'
import { css } from 'glamor'
import CallToAction from '../Frame/CallToAction'
import { SignInLink } from '../Frame/User'
import Link from 'next/link'
import { HEADER_HEIGHT } from '../constants'

const MarketingHeader = () => {
  return (
    <div {...styles.header}>
      <div style={{ paddingLeft: 16 }}>
        <Link href='/anmelden'>
          <SignInLink />
        </Link>
      </div>
      <CallToAction isOnMarketingPage={true} formatColor={undefined} />
    </div>
  )
}

const styles = {
  header: css({
    background: 'var(--color-default)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
  }),
}

export default MarketingHeader
