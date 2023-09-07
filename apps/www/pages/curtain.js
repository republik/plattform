import { css } from 'glamor'
import Head from 'next/head'
import { withRouter } from 'next/router'

import {
  NarrowContainer,
  Logo,
  mediaQueries,
  fontStyles,
} from '@project-r/styleguide'

import { SPACE } from '../components/Frame/PureFooter'

import { parseJSONObject } from '../lib/safeJSON'
import {
  PUBLIC_BASE_URL,
  CDN_FRONTEND_BASE_URL,
  CURTAIN_MESSAGE,
  CURTAIN_META,
  CURTAIN_COLORS,
} from '../lib/constants'
import { withDefaultSSR } from '../lib/apollo/helpers'

const colors = {
  color: '#fff',
  backgroundColor: '#000',
  ...parseJSONObject(CURTAIN_COLORS),
}

const styles = {
  container: css({
    ...colors,
    minHeight: '100vh',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    '& ::selection': {
      color: 'var(--color-backgroundColor)',
      backgroundColor: 'var(--color-color)',
    },
  }),
  logoContainer: css({
    textAlign: 'center',
    paddingTop: 25,
    width: 200,
    marginLeft: 'auto',
    marginRight: 'auto',
    [mediaQueries.mUp]: {
      width: 280,
      paddingTop: SPACE * 2,
    },
  }),
  message: css({
    textAlign: 'center',
    ...fontStyles.sansSerifRegular21,
    padding: 10,
    marginTop: 40,
    '& a': {
      color: 'var(--color-color)',
      textDecoration: 'underline',
      textDecorationSkip: 'ink',
    },
  }),
}

const Page = ({ router }) => {
  const meta = {
    title: 'Republik',
    description: CURTAIN_MESSAGE,
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    ...parseJSONObject(CURTAIN_META),
    url: `${PUBLIC_BASE_URL}${router.asPath.split('#')[0]}`,
  }

  return (
    <div {...styles.container}>
      <Head>
        <title>{meta.title}</title>
        <meta name='description' content={meta.description} />
        <meta property='og:type' content='website' />
        <meta property='og:url' content={meta.url} />
        <meta property='og:title' content={meta.title} />
        <meta property='og:description' content={meta.description} />
        <meta property='og:image' content={meta.image} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@RepublikMagazin' />
        <meta name='twitter:creator' content='@RepublikMagazin' />
      </Head>
      <NarrowContainer>
        <div {...styles.logoContainer}>
          <Logo fill={'var(--color-color)'} />
        </div>

        <div
          {...styles.message}
          dangerouslySetInnerHTML={{
            __html: CURTAIN_MESSAGE,
          }}
        />
      </NarrowContainer>
    </div>
  )
}

export default withDefaultSSR(withRouter(Page))
