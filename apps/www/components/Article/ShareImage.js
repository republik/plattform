import { Fragment } from 'react';
import Head from 'next/head'
import { ShareImagePreview } from '@project-r/styleguide'

const ShareImage = ({ meta }) => (
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
    />
  </Fragment>
)
export default ShareImage
