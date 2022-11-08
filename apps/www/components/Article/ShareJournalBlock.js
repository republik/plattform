import { Fragment, useState } from 'react'
import Head from 'next/head'
import {
  SlateRender,
  ColorContextProvider,
  RenderContextProvider,
  IconButton,
  ShareIcon,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
} from '@project-r/styleguide'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'
import { trackEvent } from '../../lib/matomo'
import ShareOverlay from '../ActionBar/ShareOverlay'
import { useTranslation } from '../../lib/withT'
import { css } from 'glamor'
import { useRouter } from 'next/router'

export const getShareJournalButton =
  (documentId, meta) =>
  ({ blockId }) => {
    const [overlay, showOverlay] = useState(false)
    const { t } = useTranslation()
    if (!blockId) return null
    const url = `${PUBLIC_BASE_URL}${meta.path}#${blockId}`
    const image = `${ASSETS_SERVER_BASE_URL}/render?viewport=450x1&zoomFactor=2&updatedAt=${encodeURIComponent(
      `${documentId}${meta.format ? `-${meta.format.id}` : ''}`,
    )}&url=${encodeURIComponent(
      `${PUBLIC_BASE_URL}${meta.path}?extract=${blockId}`,
    )}`
    return (
      <>
        {blockId}
        <IconButton
          Icon={ShareIcon}
          onClick={(e) => {
            e.preventDefault()
            trackEvent(['ActionBar', 'share', blockId])
            // TODO: native share with image + text
            /*if (inNativeApp) {
          postMessage({
            type: 'share',
            payload: {
              title: share.title,
              url: share.url,
              subject: share.emailSubject || '',
              dialogTitle: t('article/share/title'),
            },
          })
          e.target.blur()
        } */
            showOverlay(!overlay)
          }}
        />
        {!!overlay && (
          <ShareOverlay
            onClose={() => showOverlay(false)}
            url={url}
            image={image}
            title={t('article/actionbar/share')}
            emailSubject={'Republik Journal'}
            emailBody={`<img src=${image} width='450' />`}
            emailAttachUrl
          />
        )}
      </>
    )
  }

const shareStyle = css({
  position: 'relative',
  width: SHARE_IMAGE_WIDTH,
  height: SHARE_IMAGE_HEIGHT,
  overflow: 'hidden',
  '&:before': {
    content: ' ',
    display: 'block',
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    top: SHARE_IMAGE_HEIGHT / 2,
    height: SHARE_IMAGE_HEIGHT / 2,
    background:
      'linear-gradient(0deg, rgba(174, 195, 254,1) 0%, rgba(174, 195, 254,0)100%)',
  },
})

const ShareJournalBlock = ({ blockId, value, schema }) => {
  const { query } = useRouter()
  const crop = query?.show !== 'all'
  return (
    <Fragment>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <ColorContextProvider colorSchemeKey='light'>
        <RenderContextProvider noLazy={true}>
          <div {...(crop && shareStyle)}>
            <SlateRender
              value={value.filter((block) => block.id === blockId)}
              schema={schema}
              skip={['flyerMetaP']}
            />
          </div>
        </RenderContextProvider>
      </ColorContextProvider>
    </Fragment>
  )
}
export default ShareJournalBlock
