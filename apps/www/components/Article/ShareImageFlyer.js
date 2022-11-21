import { Fragment } from 'react'
import Head from 'next/head'
import {
  SlateRender,
  ColorContextProvider,
  RenderContextProvider,
  colors,
  Logo,
  mediaQueries,
  fontFamilies,
  useMediaQuery,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { mUp } from '@project-r/styleguide/src/theme/mediaQueries'

const styles = {
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

const ShareImageFlyer = ({ tileId, value, schema, showAll }) => {
  return (
    <Fragment>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <ColorContextProvider colorSchemeKey='light'>
        <RenderContextProvider noLazy={true}>
          <SlateRender
            value={value.filter((block) => block.id === tileId)}
            schema={schema}
            skip={['flyerMetaP']}
          />
        </RenderContextProvider>
      </ColorContextProvider>
      {showAll && <Branding />}
    </Fragment>
  )
}
export default ShareImageFlyer
