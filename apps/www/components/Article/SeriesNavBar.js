import { useState, useEffect } from 'react'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import { css } from 'glamor'
import ActionBar from '../ActionBar'
import { imageResizeUrl } from '@republik/mdast-react-render'
import Link from 'next/link'
import {
  mediaQueries,
  fontStyles,
  useColorContext,
  useBodyScrollLock,
  useHeaderHeight,
  SeriesNav,
  shouldIgnoreClick,
} from '@project-r/styleguide'
import { cleanAsPath } from '../../lib/utils/link'
import withT from '../../lib/withT'
import { IconKeyboardArrowDown, IconKeyboardArrowUp } from '@republik/icons'
const styles = {
  button: css({
    ...fontStyles.sansSerifRegular,
    padding: '5px 0',
    textAlign: 'left',
    top: 0,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    color: 'inherit',
    display: 'inline-block',
    cursor: 'pointer',
  }),
  menu: css({
    ...fontStyles.sansSerifRegular,
    position: 'fixed',
    visibility: 'hidden',
    whiteSpace: 'normal',
    opacity: 0,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    transition: 'opacity 0.2s ease-in-out, visibility 0s linear 0.2s',
    '&[aria-expanded=true]': {
      opacity: 1,
      visibility: 'visible',
      transition: 'opacity 0.2s ease-in-out',
    },
    display: 'flex',
    boxSizing: 'border-box',
    left: 0,
    width: '100vw',
    flexDirection: 'column',
    padding: 0,
    paddingTop: 20,
  }),
  title: css({
    fontSize: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
    paddingRight: '30px',
    position: 'relative',
    textOverflow: 'ellipsis',
    [mediaQueries.mUp]: {
      fontSize: 18,
    },
  }),
  logo: css({
    height: 24,
    marginRight: 6,
  }),
}

const SeriesNavBar = ({ t, me, series, router, repoId }) => {
  const [colorScheme] = useColorContext()
  const [expanded, setExpanded] = useState(false)
  const [ref] = useBodyScrollLock(expanded)
  const headerHeight = useHeaderHeight()
  const episodes = series && series.episodes
  const currentPath = cleanAsPath(router.asPath)
  const currentEpisode = episodes.find(
    (episode) => episode.document && episode.document.meta.path === currentPath,
  )

  const titlePath =
    series.overview?.meta?.path || series.episodes[0]?.documen?.meta?.path

  useEffect(() => {
    if (!expanded) {
      return
    }
    const currentEpisodeElement = window.document.querySelector(
      `[data-repo-id='${repoId}']`,
    )
    if (!currentEpisodeElement) {
      return
    }
    const { bottom } = currentEpisodeElement.getBoundingClientRect()
    const { innerHeight } = window

    if (bottom > innerHeight) {
      ref.current.scroll(0, bottom - innerHeight + 10)
    }
  }, [expanded])

  return (
    <>
      <a
        {...styles.button}
        href={titlePath}
        onClick={(e) => {
          if (shouldIgnoreClick(e)) {
            return
          }
          e.preventDefault()
          setExpanded(!expanded)
        }}
      >
        <span {...styles.title}>
          {series.logo && (
            <>
              <img
                {...styles.logo}
                src={imageResizeUrl(series.logo, 'x48')}
                {...colorScheme.set(
                  'display',
                  series.logoDark ? 'displayLight' : 'block',
                )}
              />
              {series.logoDark && (
                <img
                  {...styles.logo}
                  src={imageResizeUrl(series.logoDark, 'x48')}
                  {...colorScheme.set('display', 'displayDark')}
                />
              )}
            </>
          )}

          {series.title}

          {currentEpisode &&
            (series.title.match(/\?$/)
              ? ` ${currentEpisode.label}`
              : ` – ${currentEpisode.label}`)}
          <span>
            {expanded && (
              <IconKeyboardArrowUp
                size='28'
                {...colorScheme.set('fill', 'text')}
              />
            )}
            {!expanded && (
              <IconKeyboardArrowDown
                size='28'
                {...colorScheme.set('fill', 'text')}
              />
            )}
          </span>
        </span>
      </a>
      <div
        style={{
          top: headerHeight + 1, // 1px for border bottom
          height: `calc(100vh - ${headerHeight}px)`,
        }}
        {...colorScheme.set('backgroundColor', 'default')}
        {...colorScheme.set('color', 'text')}
        {...styles.menu}
        aria-expanded={expanded}
        ref={ref}
      >
        <SeriesNav
          repoId={repoId}
          series={series}
          context='navigation'
          ActionBar={me && ActionBar}
          Link={Link}
          onEpisodeClick={() => setExpanded(false)}
          // lazy load does not work properly in scroll component
          aboveTheFold
          seriesDescription={true}
          t={t}
        />
      </div>
    </>
  )
}

export default compose(withT, withRouter)(SeriesNavBar)
