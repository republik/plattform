import React from 'react'
import { css } from 'glamor'
import Head from 'next/head'

import {
  SlateRender,
  ColorContextProvider,
  RenderContextProvider,
  SHARE_IMAGE_HEIGHT,
  colors,
  Logo,
  mediaQueries,
  fontFamilies,
  useMediaQuery,
  CustomDescendant,
  flyerSchema,
  CustomElement,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'

const styles = {
  outer: css({
    position: 'relative',
    height: SHARE_IMAGE_HEIGHT / 2,
    background: colors.light.flyerBg,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'initial',
    overflow: 'hidden',
  }),
  inner: css({
    position: 'relative',
    top: -25,
    margin: '0 10px',
  }),
  branding: css({
    background: colors.dark.default,
    color: colors.dark.text,
  }),
  brandingInner: css({
    maxWidth: 700,
    margin: '0 auto',
    padding: '15px 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [mediaQueries.mUp]: {
      padding: '15px 0',
    },
  }),
  brandingText: css({
    fontFamily: fontFamilies.flyerTitle,
    lineHeight: 1.5,
    fontSize: 13,
    margin: 0,
    [mediaQueries.mUp]: {
      fontSize: 15,
    },
  }),
}

const Branding: React.FC = () => {
  const isDesktop = useMediaQuery(mediaQueries.mUp)
  const { t } = useTranslation()
  return (
    <div {...styles.branding}>
      <div {...styles.brandingInner}>
        <p {...styles.brandingText}>
          {t('article/flyer/tile/branding')}
          <br />
          republik.ch/journal
        </p>
        <Logo fill={colors.dark.text} height={isDesktop ? 36 : 30} />
      </div>
    </div>
  )
}

const ShareImage: React.FC<{
  tileId: string
  value: CustomElement[]
  showAll?: boolean
}> = ({ tileId, value, showAll }) => {
  return (
    <>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <ColorContextProvider colorSchemeKey='light'>
        <RenderContextProvider noLazy={true}>
          <div {...(!showAll && styles.outer)}>
            <div {...(!showAll && styles.inner)}>
              <SlateRender
                value={value.filter((block) => block.id === tileId)}
                schema={flyerSchema}
                skip={['flyerMetaP']}
              />
            </div>
          </div>
        </RenderContextProvider>
      </ColorContextProvider>
      {showAll && <Branding />}
    </>
  )
}
export default ShareImage
