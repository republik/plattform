import { css } from 'glamor'
import compose from 'lodash/flowRight'
import {
  colors,
  mediaQueries,
  fontStyles,
  useColorContext,
  SearchMenuIcon,
  BoldSearchIcon,
} from '@project-r/styleguide'

import withT from '../../lib/withT'
import NavLink from './Popover/NavLink'
import FlyerNavLink from './Popover/FlyerNavLink'

import {
  SUBHEADER_HEIGHT,
  ZINDEX_HEADER,
  HEADER_HORIZONTAL_PADDING,
} from '../constants'
import { useRouter } from 'next/router'

export const SecondaryNav = ({
  secondaryNav,
  hasOverviewNav,
  isSecondarySticky,
  t,
}) => {
  const [colorScheme] = useColorContext()
  const router = useRouter()
  const active = router.asPath

  return (
    <>
      {hasOverviewNav ? (
        <div
          {...styles.miniNav}
          {...colorScheme.set('backgroundColor', 'default')}
          {...colorScheme.set('borderColor', 'divider')}
          onTouchStart={(e) => {
            // prevent touchstart from bubbling to Pullable
            e.stopPropagation()
          }}
          style={{
            borderTopWidth: isSecondarySticky ? 0 : 1,
            borderTopStyle: 'solid',
            textAlign: 'center',
          }}
        >
          <NavLink
            href='/'
            active={active === '/front' ? '/' : active}
            minifeed
            title={t('navbar/front')}
          >
            {t('navbar/front')}
          </NavLink>
          <NavLink
            prefetch
            href='/feed'
            active={active}
            minifeed
            title={t('navbar/feed')}
          >
            {t('navbar/feed')}
          </NavLink>
          <FlyerNavLink
            active={active}
            formatColor='accentColorFlyer'
            minifeed
            title={t('navbar/flyer')}
          >
            {t('navbar/flyer')}
          </FlyerNavLink>
          <NavLink
            href='/dialog'
            active={active}
            formatColor={colors.primary}
            minifeed
            title={t('navbar/discussion')}
          >
            {t('navbar/discussion')}
          </NavLink>
          <NavLink
            href='/suche'
            active={active}
            title={t('pages/search/title')}
            noPlaceholder
            minifeed
          >
            {'/suche' === active ? (
              <BoldSearchIcon {...colorScheme.set('fill', 'text')} size={18} />
            ) : (
              <SearchMenuIcon {...colorScheme.set('fill', 'text')} size={18} />
            )}
          </NavLink>
        </div>
      ) : (
        secondaryNav && (
          <div
            {...styles.secondaryNav}
            {...colorScheme.set('color', 'text')}
            {...colorScheme.set('borderColor', 'divider')}
            {...colorScheme.set('backgroundColor', 'default')}
            style={{
              borderTopWidth: isSecondarySticky ? 0 : 1,
              borderTopStyle: 'solid',
              transition: 'opacity 0.2s ease-out',
            }}
          >
            {secondaryNav}
          </div>
        )
      )}
    </>
  )
}

const styles = {
  secondaryNav: css({
    zIndex: ZINDEX_HEADER,
    left: 0,
    right: 0,
    height: SUBHEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'flex-start',
    padding: `0px 15px`,
    [mediaQueries.mUp]: {
      justifyContent: 'center',
    },
  }),
  miniNav: css({
    overflowY: 'hidden',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    zIndex: ZINDEX_HEADER,
    height: SUBHEADER_HEIGHT,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    '::-webkit-scrollbar': {
      display: 'none',
    },
    [mediaQueries.sDown]: {
      justifyContent: 'flex-start',
    },
    '& a': {
      display: 'inline-block',
      whiteSpace: 'nowrap',
      fontSize: 14,
      margin: '12px 15px 0px 15px',
      scrollMargin: '12px 15px 0px 15px',
      '::after': {
        ...fontStyles.sansSerifMedium,
        display: 'block',
        content: 'attr(data-placeholder)',
        height: 0,
        overflow: 'hidden',
        visibility: 'hidden',
      },
      ':first-child': {
        marginLeft: HEADER_HORIZONTAL_PADDING,
        scrollMarginLeft: HEADER_HORIZONTAL_PADDING,
      },
      ':last-child': {
        marginRight: HEADER_HORIZONTAL_PADDING,
        scrollMarginRight: HEADER_HORIZONTAL_PADDING,
        [mediaQueries.mUp]: {
          paddingRight: 0,
        },
      },
      '&.is-active': {
        ...fontStyles.sansSerifMedium,
        lineHeight: '16px',
        marginTop: -1,
      },
    },
    '@media print': {
      display: 'none',
    },
  }),
  linkItem: css({
    height: SUBHEADER_HEIGHT,
  }),
}

export default compose(withT)(SecondaryNav)
