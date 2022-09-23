import { Fragment } from 'react'
import Head from 'next/head'
import { AudioCover } from '@project-r/styleguide'

const AudioCoverImage = ({ meta }) => (
  <Fragment>
    <Head>
      <meta name='robots' content='noindex' />
    </Head>
    <AudioCover
      format={meta?.format?.meta}
      image={meta['image']}
      croppedArea={meta?.audioSource?.audioCoverCrop}
    />
  </Fragment>
)
export default AudioCoverImage
