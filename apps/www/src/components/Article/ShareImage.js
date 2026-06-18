import { Fragment } from 'react'
import Head from 'next/head'
import { ShareImagePreview } from '@project-r/styleguide'

const ShareImage = ({ meta, isGift }) => (
  <Fragment>
    <Head>
      <meta name='robots' content='noindex' />
    </Head>
    <ShareImagePreview
      format={meta?.format?.meta}
      text={meta['shareText']}
      fontSize={meta['shareFontSize']}
      inverted={meta['shareInverted']}
      textPosition={meta['shareTextPosition']}
      isGift={isGift}
    />
  </Fragment>
)
export default ShareImage
