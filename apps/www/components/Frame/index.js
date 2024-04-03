import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import 'glamor/reset'
import {
  Container,
  RawHtml,
  fontFamilies,
  mediaQueries,
  ColorContextProvider,
} from '@project-r/styleguide'
import OptionalLocalColorContext from './OptionalLocalColorContext'
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
import { useTranslation } from '../../lib/withT'
import { useInNativeApp } from '../../lib/withInNativeApp'
import LegacyAppNoticeBox from './LegacyAppNoticeBox'
import { useMe } from '../../lib/context/MeContext'
import { checkRoles } from '../../lib/apollo/withMe'
import CallToActionBanner from '../CallToActions/CallToActionBanner'
import { DraftModeIndicator } from 'components/DraftModeIndicator'

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
  page: css({
    backgroundColor: 'var(--color-default)',
    color: 'var(--color-text)',
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

export const MainContainer = ({ children, maxWidth = '840px' }) => (
  <Container style={{ maxWidth }}>{children}</Container>
)

export const Content = ({ children, style }) => (
  <div {...styles.content} style={style}>
    {children}
  </div>
)

const Frame = ({
  children,
  raw,
  meta,
  cover,
  onNavExpanded,
  secondaryNav,
  formatColor,
  footer = true,
  pullable,
  hasOverviewNav: wantOverviewNav,
  stickySecondaryNav,
  isOnMarketingPage,
  pageColorSchemeKey,
  containerMaxWidth,
  draftMode,
  /**
   * customContentColorContext are the colors passed to the color-context
   * that only wraps the content of the page.
   * (This will not be applied to the header, footer and body of the page)
   */
  customContentColorContext,
  hideCTA = false,
}) => {
  const { inNativeApp, inNativeAppLegacy } = useInNativeApp()
  const { t } = useTranslation()
  const { me, hasAccess } = useMe()
  const isClimateLabOnlyUser = checkRoles(me, ['climate'])

  const hasOverviewNav = (hasAccess || isClimateLabOnlyUser) && wantOverviewNav
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
    <ColorContextProvider colorSchemeKey={pageColorSchemeKey}>
      <noscript>
        <Box style={{ padding: 30 }}>
          <RawHtml
            dangerouslySetInnerHTML={{
              __html: t('noscript'),
            }}
          />
        </Box>
      </noscript>
      <div
        {...(footer || inNativeApp ? styles.bodyGrowerContainer : undefined)}
      >
        {/* body growing only needed when rendering a footer */}
        <div
          {...(footer || inNativeApp ? styles.bodyGrower : undefined)}
          {...padHeaderRule}
          {...styles.page}
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
            <OptionalLocalColorContext
              localColorVariables={customContentColorContext}
            >
              <div {...styles.page}>
                {!hideCTA && <CallToActionBanner />}

                {draftMode && <DraftModeIndicator />}

                {raw ? (
                  <>{children}</>
                ) : (
                  <MainContainer maxWidth={containerMaxWidth}>
                    <Content>{children}</Content>
                  </MainContainer>
                )}
              </div>
            </OptionalLocalColorContext>
          </Header>
        </div>
        {!inNativeApp && footer && (
          <Footer isOnMarketingPage={isOnMarketingPage} />
        )}
      </div>
    </ColorContextProvider>
  )
}

Frame.propTypes = {
  children: PropTypes.node.isRequired,
  raw: PropTypes.bool,
  meta: PropTypes.object,
  cover: PropTypes.any,
  onNavExpanded: PropTypes.any,
  secondaryNav: PropTypes.any,
  formatColor: PropTypes.string,
  footer: PropTypes.bool,
  pullable: PropTypes.bool,
  hasOverviewNav: PropTypes.bool,
  stickySecondaryNav: PropTypes.any,
  isOnMarketingPage: PropTypes.bool,
  pageColorSchemeKey: PropTypes.string,
  containerMaxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  customContentColorContext: PropTypes.object,
  hideCTA: PropTypes.bool,
  draftMode: PropTypes.bool,
}

export default Frame
