import { Fragment } from 'react'
import Head from 'next/head'
import {
  SlateRender,
  ColorContextProvider,
  RenderContextProvider,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
  colors,
  Logo,
  mediaQueries,
  fontFamilies,
  useMediaQuery,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { mUp } from '@project-r/styleguide/src/theme/mediaQueries'

const styles = {
  outer: css({
    position: 'relative',
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    background: colors.light.flyerBg,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  inner: css({
    maxWidth: SHARE_IMAGE_WIDTH,
    maxHeight: SHARE_IMAGE_HEIGHT,
    overflow: 'hidden',
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

const Branding = () => {
  const isDesktop = useMediaQuery(mUp)
  return (
    <div {...styles.branding}>
      <div {...styles.brandingInner}>
        <p {...styles.brandingText}>
          Mehr Kurzes:
          <br />
          www.republik/journal
        </p>
        <Logo fill={colors.dark.text} height={isDesktop ? 36 : 30} />
      </div>
    </div>
  )
}

const ShareImageFlyer = ({ blockId, value, schema, showAll }) => {
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
      {showAll && <Branding />}
    </Fragment>
  )
}
export default ShareImageFlyer
