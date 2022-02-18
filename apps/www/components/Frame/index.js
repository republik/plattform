import React, { useMemo } from 'react'
import { css } from 'glamor'
import 'glamor/reset'
import compose from 'lodash/flowRight'
import {
  Container,
  RawHtml,
  fontFamilies,
  mediaQueries,
  ColorHtmlBodyColors,
  ColorContextProvider,
} from '@project-r/styleguide'
import Meta from './Meta'
import Header from './Header'
import Footer from '../Footer'
import Box from './Box'
import ProlongBox from './ProlongBox'
import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  SUBHEADER_HEIGHT,
  FRAME_CONTENT_PADDING,
  FRAME_CONTENT_PADDING_MOBILE,
} from '../constants'
import { withMembership } from '../Auth/checkRoles'
import withT from '../../lib/withT'
import { useInNativeApp } from '../../lib/withInNativeApp'
import LegacyAppNoticeBox from './LegacyAppNoticeBox'
import { useMe } from '../../lib/context/MeContext'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  width: '100%',
  fontFamily: fontFamilies.sansSerifRegular,
})

css.global('button', {
  fontFamily: fontFamilies.sansSerifRegular,
})

// avoid gray rects over links and icons on iOS
css.global('*', {
  WebkitTapHighlightColor: 'transparent',
})
// avoid orange highlight, observed around full screen gallery, on Android
css.global('div:focus', {
  outline: 'none',
})

// Manually set hyphenate-character to U+002D
// Used as a workaround for chrome on MacOS Monterrey
// Underlying issue: https://bugs.chromium.org/p/chromium/issues/detail?id=1267606#c24
css.global('body', {
  WebkitHyphenateCharacter: "'\\2D'",
})

const styles = {
  bodyGrowerContainer: css({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  }),
  padHeader: css({
    // minus 1px for first sticky hr from header
    // - otherwise there is a jump when scroll 0 and opening hamburger
    paddingTop: HEADER_HEIGHT_MOBILE - 1,
    [mediaQueries.mUp]: {
      paddingTop: HEADER_HEIGHT - 1,
    },
  }),
  bodyGrower: css({
    flexGrow: 1,
  }),
  content: css({
    paddingTop: FRAME_CONTENT_PADDING_MOBILE,
    paddingBottom: FRAME_CONTENT_PADDING_MOBILE * 2,
    [mediaQueries.mUp]: {
      paddingTop: FRAME_CONTENT_PADDING,
      paddingBottom: FRAME_CONTENT_PADDING * 2,
    },
  }),
}

export const MainContainer = ({ children }) => (
  <Container style={{ maxWidth: '840px' }}>{children}</Container>
)

export const Content = ({ children, style }) => (
  <div {...styles.content} style={style}>
    {children}
  </div>
)

const Frame = ({
  t,
  children,
  raw,
  meta,
  cover,
  onNavExpanded,
  secondaryNav,
  formatColor,
  footer = true,
  pullable,
  isMember,
  hasOverviewNav: wantOverviewNav,
  stickySecondaryNav,
  isOnMarketingPage,
  pageColorSchemeKey,
}) => {
  const { inNativeApp, inNativeAppLegacy } = useInNativeApp()
  const { me } = useMe()

  const hasOverviewNav = isMember && wantOverviewNav
  const hasSecondaryNav = !!(secondaryNav || hasOverviewNav)
  const padHeaderRule = useMemo(() => {
    return css({
      paddingTop: hasSecondaryNav
        ? HEADER_HEIGHT_MOBILE + SUBHEADER_HEIGHT
        : HEADER_HEIGHT_MOBILE - 1,
      [mediaQueries.mUp]: {
        paddingTop: hasSecondaryNav
          ? HEADER_HEIGHT + SUBHEADER_HEIGHT
          : HEADER_HEIGHT - 1,
      },
    })
  }, [hasSecondaryNav])
  return (
    <div {...(footer || inNativeApp ? styles.bodyGrowerContainer : undefined)}>
      {/* body growing only needed when rendering a footer */}
      <div
        {...(footer || inNativeApp ? styles.bodyGrower : undefined)}
        {...padHeaderRule}
      >
        {!!meta && <Meta data={meta} />}
        <Header
          me={me}
          cover={cover}
          onNavExpanded={onNavExpanded}
          secondaryNav={secondaryNav}
          formatColor={formatColor}
          pullable={pullable}
          hasOverviewNav={hasOverviewNav}
          stickySecondaryNav={stickySecondaryNav}
          isOnMarketingPage={isOnMarketingPage}
          pageColorSchemeKey={pageColorSchemeKey}
        >
          <ColorContextProvider colorSchemeKey={pageColorSchemeKey}>
            <ColorHtmlBodyColors
              colorSchemeKey={pageColorSchemeKey || 'auto'}
            />
            <noscript>
              <Box style={{ padding: 30 }}>
                <RawHtml
                  dangerouslySetInnerHTML={{
                    __html: t('noscript'),
                  }}
                />
              </Box>
            </noscript>
            {inNativeAppLegacy && <LegacyAppNoticeBox t={t} />}
            {me &&
              me.prolongBeforeDate !== null &&
              me.activeMembership !== null && (
                <ProlongBox
                  t={t}
                  prolongBeforeDate={me.prolongBeforeDate}
                  membership={me.activeMembership}
                />
              )}
            {raw ? (
              children
            ) : (
              <MainContainer>
                <Content>{children}</Content>
              </MainContainer>
            )}
          </ColorContextProvider>
        </Header>
      </div>
      {!inNativeApp && footer && (
        <Footer isOnMarketingPage={isOnMarketingPage} />
      )}
    </div>
  )
}

export default compose(withMembership, withT)(Frame)
