import { Fragment } from 'react'
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
} from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  outer: css({
    position: 'relative',
    height: SHARE_IMAGE_HEIGHT / 2,
    background: colors.light.flyerBg,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'initial',
    overflow: 'hidden',
    '&:before': {
      content: ' ',
      display: 'block',
      position: 'absolute',
      zIndex: 1,
      left: 0,
      right: 0,
      bottom: 0,
      height: 80,
      background:
        'linear-gradient(0deg, rgba(174, 195, 254,1) 0%, rgba(174, 195, 254,0.8) 30%, rgba(174, 195, 254,0)100%)',
    },
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

const Branding = () => {
  const isDesktop = useMediaQuery(mediaQueries.mUp)
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

const ShareImageFlyer = ({ tileId, value, schema, showAll }) => {
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
                value={value.filter((block) => block.id === tileId)}
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
