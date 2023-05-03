import { useMemo } from 'react'
import { css } from 'glamor'
import Head from 'next/head'
import { withRouter } from 'next/router'

import withInNativeApp from '../lib/withInNativeApp'

import ActionBar from '../components/ActionBar'
import PureFooter, { SPACE, A } from '../components/Frame/PureFooter'

import {
  NarrowContainer,
  Logo,
  BrandMark as R,
  fontFamilies,
  mediaQueries,
  useColorContext,
  ColorHtmlBodyColors,
} from '@project-r/styleguide'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'
import Link from 'next/link'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { IconBack } from '@republik/icons'

const pRule = css({
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 18,
})

const P = ({ children, ...props }) => (
  <p {...props} {...pRule}>
    {children}
  </p>
)

export const styles = {
  back: css({
    fontFamily: fontFamilies.sansSerifRegular,
    textDecoration: 'none',
    fontSize: 20,
    marginTop: 9 + 4,
    marginBottom: -20,
    display: 'block',
  }),
  text: css({
    marginTop: SPACE / 2,
    marginBottom: SPACE,
    fontFamily: fontFamilies.serifRegular,
    fontSize: 18,
    lineHeight: '27px',
  }),
  highlight: css({
    fontFamily: fontFamilies.serifBold,
    fontSize: 24,
    lineHeight: '36px',
  }),
  strong: css({
    fontFamily: fontFamilies.serifBold,
  }),
  logoContainer: css({
    textAlign: 'center',
    marginBottom: SPACE,
  }),
  column: css({
    maxWidth: 500,
    margin: `${SPACE}px auto`,
  }),
  nav: css({
    marginTop: SPACE,
    marginBottom: SPACE,
    [mediaQueries.mUp]: {
      marginTop: SPACE,
      marginBottom: SPACE * 2,
    },
  }),
  mainNav: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 44,
    lineHeight: '60px',
  }),
  address: css({
    lineHeight: 1.6,
    fontStyle: 'normal',
  }),
}

export const Highlight = ({ children, ...props }) => (
  <span {...props} {...styles.highlight}>
    {children}
  </span>
)
export const Strong = ({ children }) => (
  <span {...styles.strong}>{children}</span>
)

export const Back = withInNativeApp(({ inNativeApp, label }) => {
  const [colorScheme] = useColorContext()
  if (!inNativeApp) return null
  return (
    <Link
      href='/'
      passHref
      {...styles.back}
      {...colorScheme.set('color', 'logo')}
    >
      <IconBack size={25} style={{ marginTop: -3 }} />
      {label}
    </Link>
  )
})

const Page = ({ router }) => {
  const [colorScheme] = useColorContext()

  const selectionRule = useMemo(
    () =>
      css({
        '& ::selection': {
          color: colorScheme.getCSSColor('default'),
          background: colorScheme.getCSSColor('accentColorMeta'),
        },
      }),
    [colorScheme],
  )

  const meta = {
    title: 'Das Project-R-Manifest für die Republik',
    description: 'Jetzt Mitglied und Abonnentin werden.',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/manifest.png`,
    url: `${PUBLIC_BASE_URL}${router.pathname}`,
  }

  const shareObject = {
    url: meta.url,
    emailSubject: 'Republik Manifest',
    emailAttachUrl: false,
    emailBody: `
Für diesen Journalismus steht Project R: ${meta.url}

Jetzt Mitglied und Abonnentin werden:
${PUBLIC_BASE_URL}
`,
    overlayTitle: 'Manifest teilen',
  }

  return (
    <NarrowContainer>
      <ColorHtmlBodyColors colorSchemeKey='auto' />
      <Head>
        <title>Manifest – Republik</title>
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
      <Back label='Magazin' />
      <div {...styles.column} {...selectionRule}>
        <R />

        <div {...styles.text}>
          <Highlight>Ohne Journalismus keine Demokratie.</Highlight>
          <br />
          Und ohne Demokratie keine Freiheit. Wenn der Journalismus stirbt,
          stirbt auch die{' '}
          <Strong>
            offene Gesellschaft, das freie Wort, der Wettbewerb der besten
            Argumente. Freier Journalismus
          </Strong>{' '}
          war die erste Forderung der <Strong>liberalen Revolution.</Strong> Und
          das Erste, was jede Diktatur wieder abschafft. Journalismus ist ein
          Kind <Strong>der Aufklärung.</Strong> Seine Aufgabe ist die{' '}
          <Strong>Kritik der Macht.</Strong> Deshalb ist Journalismus mehr als
          nur ein Geschäft für irgendwelche Konzerne. Wer Journalismus macht,
          übernimmt <Strong>Verantwortung für die Öffentlichkeit.</Strong> Denn
          in der Demokratie gilt das Gleiche wie überall im Leben: Menschen
          brauchen{' '}
          <Strong>
            vernünftige Informationen, um vernünftige Entscheidungen zu treffen.
          </Strong>{' '}
          Guter Journalismus schickt{' '}
          <Strong>Expeditionsteams in die Wirklichkeit.</Strong> Seine Aufgabe
          ist, den Bürgerinnen und Bürgern die{' '}
          <Strong>Fakten und Zusammenhänge</Strong> zu liefern, pur,{' '}
          <Strong>unabhängig,</Strong> nach bestem Gewissen,{' '}
          <Strong>ohne Furcht</Strong> vor niemandem als der Langweile.
          Journalismus strebt nach <Strong>Klarheit</Strong>, er ist{' '}
          <Strong>der Feind der uralten Angst vor dem Neuen.</Strong>{' '}
          Journalismus braucht <Strong>Leidenschaft,</Strong> Können und
          Ernsthaftigkeit. Und ein aufmerksames, neugieriges,{' '}
          <Strong>furchtloses Publikum.</Strong>{' '}
          <Highlight style={{ verticalAlign: 'top' }}>Sie!</Highlight>
        </div>
      </div>

      <div {...styles.logoContainer}>
        <Logo width={200} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: SPACE }}>
        <P>Manifest teilen</P>
        <div style={{ marginBottom: SPACE / 2 }}>
          <ActionBar isCentered share={shareObject} />
        </div>
        <P>
          <A href={`${CDN_FRONTEND_BASE_URL}/static/manifest.pdf`}>
            Manifest als PDF herunterladen
          </A>
        </P>

        <PureFooter />
      </div>
    </NarrowContainer>
  )
}

export default withDefaultSSR(withRouter(Page))
