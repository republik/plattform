import { css } from 'glamor'
import compose from 'lodash/flowRight'
import {
  colors,
  mediaQueries,
  fontStyles,
  useColorContext,
} from '@project-r/styleguide'

import withT from '../../lib/withT'
import NavLink from './Popover/NavLink'

import {
  SUBHEADER_HEIGHT,
  ZINDEX_HEADER,
  HEADER_HORIZONTAL_PADDING,
} from '../constants'
import { useRouter } from 'next/router'
import { useFlyerMeta } from '../../lib/apollo/miniNavi'

const sections = [
  {
    title: 'Meta',
    href: '/meta',
    color: '#000',
    kind: null,
  },
  {
    title: 'Briefings',
    href: '/briefings',
    color: '#07809a',
    kind: 'editorial',
  },
  {
    title: 'Kolumnen',
    href: '/kolumnen',
    color: '#D2933C',
    kind: null,
  },
  {
    title: 'Formate',
    href: '/formate',
    color: '#d44438',
    kind: 'scribble',
  },
  {
    title: 'Audio',
    href: '/audio',
    color: null,
    kind: null,
  },
  {
    title: 'Serien',
    href: '/serien',
    color: null,
    kind: null,
  },
]

export const SecondaryNav = ({
  secondaryNav,
  hasOverviewNav,
  isSecondarySticky,
  t,
}) => {
  const [colorScheme] = useColorContext()
  const router = useRouter()
  const active = router.asPath

  const flyerMeta = useFlyerMeta()

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
          {flyerMeta?.path && (
            <NavLink
              href={flyerMeta?.path || '/format/journal'}
              active={active}
              formatColor='accentColorFlyer'
              minifeed
              title={flyerMeta?.title || t('navbar/flyer')}
            >
              {t('navbar/flyer')}
            </NavLink>
          )}
          <NavLink
            href='/dialog'
            active={active}
            formatColor={colors.primary}
            minifeed
            title={t('navbar/discussion')}
          >
            {t('navbar/discussion')}
          </NavLink>
          {!flyerMeta?.path &&
            sections.map((section) => {
              const color = section.color || colors[section.kind]
              return (
                <NavLink
                  key={section.title}
                  href={section.href}
                  active={active}
                  formatColor={color}
                  minifeed
                  title={section.title}
                >
                  {section.title}
                </NavLink>
              )
            })}
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
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    '::-webkit-scrollbar': {
      display: 'none',
    },
    [mediaQueries.mUp]: {
      textAlign: 'center',
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
        content: 'attr(title)',
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
