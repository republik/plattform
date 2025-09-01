import { useState, useEffect, useRef } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { ascending } from 'd3-array'
import { css } from 'glamor'

import {
  Loader,
  colors,
  FormatTag,
  fontStyles,
  mediaQueries,
  useColorContext,
  Center,
} from '@project-r/styleguide'
import NavLink from '../Frame/Popover/NavLink'
import Link from 'next/link'
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../constants'
import withT from '../../lib/withT'
import { IconChevronRight } from '@republik/icons'

const getSectionNav = gql`
  query getSectionNav {
    sections: documents(template: "section", feed: true) {
      nodes {
        id
        meta {
          title
          path
          color
          kind
        }
        formats: linkedDocuments(feed: true) {
          nodes {
            id
            meta {
              title
              path
              color
              kind
            }
            linkedDocuments(first: 0) {
              totalCount
            }
          }
        }
      }
    }
  }
`

const Panel = ({
  isMobile,
  isActivePanel,
  href,
  dark,
  active,
  closeHandler,
  color,
  meta,
  formats,
}) => {
  const panelRef = useRef(null)
  const [panelHeight, setPanelHeight] = useState()
  useEffect(() => {
    const measure = () => {
      setPanelHeight(panelRef.current.scrollHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [])
  return (
    <div
      ref={panelRef}
      style={
        isMobile
          ? {
              height: isActivePanel ? `${panelHeight}px` : 0,
              opacity: isActivePanel ? 1 : 0,
            }
          : {}
      }
      {...styles.accordionBody}
    >
      {!isMobile && (
        <div {...styles.sectionLink}>
          <NavLink
            dark={dark}
            href={href}
            currentPath={active}
            closeHandler={closeHandler}
            formatColor={color}
            inline
          >
            {meta.title}
          </NavLink>
        </div>
      )}
      {[]
        .concat(formats.nodes)
        .sort((a, b) => ascending(a.meta.title, b.meta.title))
        .map(({ id, meta: formatMeta, linkedDocuments }) => (
          <Link
            href={formatMeta.path}
            key={id}
            passHref
            {...styles.formatLink}
            onClick={() => closeHandler?.()}
          >
            <FormatTag
              color={formatMeta.color || colors[formatMeta.kind]}
              label={formatMeta.title}
              count={linkedDocuments.totalCount || null}
            />
          </Link>
        ))}
    </div>
  )
}

const Sections = compose(graphql(getSectionNav))(
  ({ data: { loading, error, sections }, active, closeHandler, dark }) => {
    const [isMobile, setIsMobile] = useState(false)
    const [activePanel, setActivePanel] = useState(null)

    useEffect(() => {
      const measure = () => {
        setIsMobile(window.innerWidth < mediaQueries.mBreakPoint)
      }
      measure()
      window.addEventListener('resize', measure)
      return () => {
        window.removeEventListener('resize', measure)
      }
    }, [])

    return (
      <Loader
        delay={1000}
        loading={loading}
        error={error}
        style={{ minHeight: 110 }}
        render={() => {
          return (
            <>
              {sections &&
                sections.nodes.map(({ id, meta, formats }, i) => {
                  const { path } = meta
                  if (!path) {
                    return null
                  }
                  const color = meta.color || colors[meta.kind]
                  const isActivePanel = activePanel === i
                  if (!formats.nodes.length) {
                    // Serien
                    return (
                      <div {...styles.sectionContainer} key={id}>
                        <div {...styles.sectionLink}>
                          <NavLink
                            dark={dark}
                            href={path}
                            currentPath={active}
                            closeHandler={closeHandler}
                            formatColor={color}
                            inline
                          >
                            {meta.title}
                          </NavLink>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div {...styles.sectionContainer} key={id}>
                      {isMobile && (
                        <div
                          {...styles.accordionHead}
                          {...styles.sectionLink}
                          onClick={() =>
                            setActivePanel(isActivePanel ? null : i)
                          }
                        >
                          <NavLink
                            dark={dark}
                            href={path}
                            currentPath={active}
                            closeHandler={closeHandler}
                            formatColor={color}
                            inline
                          >
                            {meta.title}
                          </NavLink>
                          <IconChevronRight
                            size={22}
                            style={{
                              transition: 'transform 0.3s ease-out',
                              transform: isActivePanel
                                ? 'rotate(270deg)'
                                : 'rotate(90deg)',
                            }}
                          />
                        </div>
                      )}
                      <Panel
                        key={id}
                        isMobile={isMobile}
                        isActivePanel={isActivePanel}
                        href={path}
                        dark={dark}
                        active={active}
                        closeHandler={closeHandler}
                        color={color}
                        meta={meta}
                        formats={formats}
                      />
                    </div>
                  )
                })}
            </>
          )
        }}
      />
    )
  },
)

const FeaturedSections = withT(({ t }) => {
  const [colorScheme] = useColorContext()
  return (
    <Center style={{ padding: 0 }}>
      <div {...styles.navSection}>
        <Sections vertical />
        <NavLink href='/rubriken'>{t('nav/sections')}</NavLink>
      </div>
      <hr
        {...styles.hr}
        {...colorScheme.set('color', 'divider')}
        {...colorScheme.set('backgroundColor', 'divider')}
      />
      <div {...styles.navSection}>
        <div
          {...styles.navLinks}
          style={{
            marginBottom: 24,
          }}
        >
          <NavLink large href='/cockpit'>
            {t('nav/cockpit')}
          </NavLink>
          <NavLink large href='/veranstaltungen'>
            {t('nav/events')}
          </NavLink>
          <NavLink large href='/impressum'>
            {t('nav/team')}
          </NavLink>
        </div>
      </div>
    </Center>
  )
})

const styles = {
  hr: css({
    margin: 0,
    display: 'block',
    border: 0,
    height: 1,
    width: '100%',
  }),
  hrFixed: css({
    position: 'fixed',
    top: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      top: HEADER_HEIGHT,
    },
  }),
  signInBlock: css({
    display: 'block',
  }),
  navSection: css({
    display: 'flex',
    flexDirection: 'column',
    margin: '24px 0px',
  }),
  navLinks: css({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  sectionContainer: css({
    display: 'flex',
    flexDirection: 'column',
    marginTop: 0,
    marginBottom: 24,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
    '& a': {
      ...fontStyles.sansSerifMedium20,
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifMedium22,
      },
    },
  }),
  formatLink: css({
    color: 'inherit',
    textDecoration: 'none',
    margin: '0',
    '& div': {
      ...fontStyles.sansSerifMedium16,
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifMedium20,
      },
    },
  }),
  sectionLink: css({
    '& a': {
      margin: '0 20px 5px 0',
      ...fontStyles.sansSerifMedium20,
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifMedium22,
      },
    },
  }),
  accordionHead: css({
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer',
    [mediaQueries.mUp]: {},
  }),
  accordionBody: css({
    overflow: 'hidden',
    transition: 'height 0.2s ease-out, opacity 0.3s ease-out',
    [mediaQueries.mUp]: {
      overflow: 'initial',
    },
  }),
}

export default FeaturedSections
