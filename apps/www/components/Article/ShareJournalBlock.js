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
  colors,
} from '@project-r/styleguide'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'
import { trackEvent } from '../../lib/matomo'
import ShareOverlay from '../ActionBar/ShareOverlay'
import { useTranslation } from '../../lib/withT'
import { css } from 'glamor'

export const getShareJournalButton =
  (documentId, meta) =>
  ({ blockId }) => {
    const [overlay, showOverlay] = useState(false)
    const { t } = useTranslation()
    if (!blockId) return null
    const url = `${PUBLIC_BASE_URL}${meta.path}#${blockId}`

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
            title={t('article/actionbar/share')}
            emailSubject={'Republik Journal'}
            emailAttachUrl
          />
        )}
      </>
    )
  }

const styles = {
  outer: css({
    position: 'relative',
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    background: colors.light.flyerBg,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    /*'&:before': {
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
    },*/
  }),
  inner: css({
    maxWidth: SHARE_IMAGE_WIDTH,
    maxHeight: SHARE_IMAGE_HEIGHT,
    overflow: 'hidden',
  }),
}

const ShareJournalBlock = ({ blockId, value, schema, showAll }) => {
  return (
    <Fragment>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <ColorContextProvider colorSchemeKey='light'>
        <RenderContextProvider noLazy={true}>
          <div {...(!showAll && styles.outer)}>
            <div {...(!showAll && styles.inner)}>
              <SlateRender
                value={value.filter((block) => block.id === blockId)}
                schema={schema}
                skip={['flyerMetaP']}
              />
            </div>
          </div>
        </RenderContextProvider>
      </ColorContextProvider>
    </Fragment>
  )
}
export default ShareJournalBlock
