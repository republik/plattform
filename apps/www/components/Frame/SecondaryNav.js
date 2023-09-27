import { useMemo } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import {
  colors,
  mediaQueries,
  fontStyles,
  useColorContext,
  Scroller,
} from '@project-r/styleguide'

import withT from '../../lib/withT'
import NavLink from './Popover/NavLink'

import {
  SUBHEADER_HEIGHT,
  ZINDEX_HEADER,
  HEADER_HORIZONTAL_PADDING,
} from '../constants'
import { useRouter } from 'next/router'
import { useMe } from '../../lib/context/MeContext'
import { IconSearchMenu, IconSearchMenuBold } from '@republik/icons'

export const SecondaryNav = ({
  secondaryNav,
  hasOverviewNav,
  isSecondarySticky,
  t,
}) => {
  const [colorScheme] = useColorContext()
  const router = useRouter()
  const currentPath = router.asPath
  const { hasAccess, isClimateLabMember } = useMe()

  // Sine ClimateLab the elements are rendered in a Scroller.
  // To calculate the active index inside the scroller,
  // we must handle conditional rendering of the elements
  // individually.
  const activeNavigationItemIndex = useMemo(() => {
    if (!hasOverviewNav) {
      return -1
    }

    return ['/', '/feed', '/journal', '/dialog', '/suche'].indexOf(currentPath)
  }, [currentPath, isClimateLabMember, hasOverviewNav])

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
          <Scroller activeChildIndex={activeNavigationItemIndex}>
            <NavLink
              href='/'
              currentPath={currentPath === '/front' ? '/' : currentPath}
              minifeed
              title={t('navbar/front')}
              style={{ margin: '12px 10px 0px' }}
            >
              {t('navbar/front')}
            </NavLink>
            <NavLink
              prefetch
              href='/feed'
              currentPath={currentPath}
              minifeed
              title={t('navbar/feed')}
              style={{ margin: '12px 10px 0px' }}
            >
              {t('navbar/feed')}
            </NavLink>
            <NavLink
              href='/dialog'
              currentPath={currentPath}
              formatColor={colors.primary}
              minifeed
              title={t('navbar/discussion')}
              style={{ margin: '12px 10px 0px' }}
            >
              {t('navbar/discussion')}
            </NavLink>
            <NavLink
              href='/dossier/welche-schweiz-wollen-wir'
              currentPath={currentPath}
              minifeed
              title={'Wahlen 2023'}
              style={{ margin: '12px 10px 0px' }}
            >
              {'Wahlen 2023'}
            </NavLink>
            <NavLink
              href='/suche'
              currentPath={currentPath}
              title={t('pages/search/title')}
              noPlaceholder
              minifeed
              style={{ margin: '12px 0px 0px' }}
            >
              {'/suche' === currentPath ? (
                <IconSearchMenuBold
                  {...colorScheme.set('fill', 'text')}
                  size={18}
                />
              ) : (
                <IconSearchMenu
                  {...colorScheme.set('fill', 'text')}
                  size={18}
                />
              )}
            </NavLink>
          </Scroller>
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
