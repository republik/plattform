import { css, merge } from 'glamor'
import { useEffect, useRef, useState } from 'react'

// TODO: get rid of styleguide dep
import { useColorContext } from './__styleguide/components/Colors/ColorContext'
import * as mediaQueries from './__styleguide/theme/mediaQueries'

import { ChapterIndicator } from './ChapterIndicator'
import { StoryGraphic } from './StoryGraphicBanks'
import { NEW_COLORS } from './config'

const CHAPTER_IDS = ['kapitel-1', 'kapitel-2', 'kapitel-3', 'kapitel-4']

export const Scrolly = () => {
  const [colorScheme] = useColorContext()
  const [currentChapter, setCurrentChapter] = useState<number>(1)
  const containerRef = useRef<HTMLDivElement>()
  const chartRef = useRef<HTMLDivElement>()
  const [isFixed, setFixed] = useState<boolean>(false)

  const handleScroll = () => {
    const tops = CHAPTER_IDS.map((id) =>
      // 400 = magic number to accomodate space taken by chart
      // we should get rid of that crap
      Math.abs(document.getElementById(id).getBoundingClientRect().top - 400),
    )
    const i = tops.indexOf(Math.min(...tops))
    // console.log(i + 1)
    setCurrentChapter(i + 1)

    // hack for the chart to stay in view
    if (chartRef.current.getBoundingClientRect().top <= 80) setFixed(true)
    if (
      chartRef.current.getBoundingClientRect().bottom <
      containerRef.current.getBoundingClientRect().bottom
    )
      setFixed(false)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ height: 3000, maxHeight: '40vh' }} ref={containerRef}>
      <div
        {...merge(
          styles.scrollyGraphicsContainer,
          isFixed && styles.scrollyGraphicsContainerScrolled,
        )}
        {...colorScheme.set('backgroundColor', 'default')}
        ref={chartRef}
      >
        <div
          {...styles.scrollyGraphicsChapters}
          {...colorScheme.set('backgroundColor', 'default')}
          style={{ opacity: currentChapter ? 1 : 0 }}
        >
          <ChapterIndicator mini highlighted={currentChapter === 1}>
            1
          </ChapterIndicator>
          <ChapterIndicator mini highlighted={currentChapter === 2}>
            2
          </ChapterIndicator>
          <ChapterIndicator mini highlighted={currentChapter === 3}>
            3
          </ChapterIndicator>
          <ChapterIndicator mini highlighted={currentChapter === 4}>
            4
          </ChapterIndicator>
        </div>

        <StoryGraphic highlighted={currentChapter} />
      </div>
    </div>
  )
}

const styles = {
  scrollyGraphicsContainer: css({
    padding: '48px',
    /* min-height: 50dvh; */
    width: '100vw',
    // Beautiful hack to break out to full width from whatever the container size is at the moment
    marginLeft: 'calc(-50vw + 50%)',
    left: 0,
    zIndex: 1,
    display: 'flex',
    maxHeight:
      '40vh' /* don't use dvh here, otherwise the layout will jump when scrolling */,
    backdropFilter: 'blur(20px)',
    boxShadow: '0px 5px 5px 0px rgba(0,0,0,0.05)',

    [mediaQueries.mUp]: {
      padding: '40px',
    },
  }),
  scrollyGraphicsContainerScrolled: css({
    position: 'fixed',
    top: 80,
    left: 0,
    marginLeft: 'auto',
  }),
  scrollyGraphicsChapters: css({
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 0,
    textAlign: 'center',
    justifyContent: 'center',
    opacity: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: 0,
  }),
  highlight: css({
    whiteSpace: 'nowrap',
    margin: '-1px 0 1px 0',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.3em',
    padding: '0.2em',
    lineHeight: '20px',
  }),
  circle: css({
    display: 'inline-block',
    borderRadius: '50%',
    width: '12px',
    height: '12px',
    marginRight: '5px',
  }),
}

const Highlight = ({ color, colorKey, children }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        verticalAlign: 'text-top',
        padding: '0 5px',
      }}
    >
      <span
        {...styles.highlight}
        style={{ backgroundColor: NEW_COLORS[colorKey].lightBackground }}
      >
        <span
          {...styles.circle}
          style={{ backgroundColor: NEW_COLORS[colorKey][color] }}
        />
        {children}
      </span>
    </span>
  )
}
