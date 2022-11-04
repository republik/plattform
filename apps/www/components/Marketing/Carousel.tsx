import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
  mediaQueries,
  IconButton,
  PlayCircleIcon,
  ArticleIcon,
  useColorContext,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { getImgSrc } from '../Overview/utils'
import { useQuery } from '@apollo/client'
import { GET_DOCUMENT_AUDIO } from './graphql/DocumentAudio.graphql'
import { trackEvent } from '../../lib/matomo'
import { useAudioContext } from '../Audio/AudioProvider'
import useAudioQueue from '../Audio/hooks/useAudioQueue'
import scrollIntoView from 'scroll-into-view'

export type CarouselProps = { carouselData: any }

type CarouselItem = {
  src: string
  path: string
}

const PlayAudio: React.FC<{ path: string }> = ({ path }) => {
  const { data } = useQuery(GET_DOCUMENT_AUDIO, { variables: { path } })
  const { toggleAudioPlayer, isPlaying } = useAudioContext()
  const { checkIfActiveItem } = useAudioQueue()

  if (!data?.document) {
    return null
  }

  const { document } = data

  return (
    <IconButton
      onClick={(e) => {
        e.preventDefault()
        trackEvent(['Marketing', 'play', document.id])
        toggleAudioPlayer(document)
      }}
      Icon={PlayCircleIcon}
      labelShort='Hören'
      label='Hören'
      disabled={checkIfActiveItem(document.id) && isPlaying}
    />
  )
}

const Carousel: React.FC<CarouselProps> = ({ carouselData }) => {
  const items: CarouselItem[] = carouselData?.content?.children?.map(
    ({ data }) => ({
      src: getImgSrc(data, '/', 1200),
      path: data.url,
    }),
  )
  const carouselRef = useRef<HTMLDivElement>()
  const [colorScheme] = useColorContext()

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [disableScrollIntoView, setDisableScrollIntoView] = useState(false)
  const [disableScrollListener, setDisableScrollListener] = useState(false)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || disableScrollListener) {
      return
    }
    const onScroll = () => {
      setDisableScrollIntoView(true)
      const slideWidth = carousel.scrollWidth / items.length

      const newIndex = Math.floor(
        (slideWidth / 2 + carousel.scrollLeft) / slideWidth,
      )
      if (newIndex !== currentSlideIndex) {
        setCurrentSlideIndex(newIndex)
      }
    }
    carousel.addEventListener('scroll', onScroll)
    return () => {
      carousel.removeEventListener('scroll', onScroll)
    }
  }, [currentSlideIndex, disableScrollListener])

  useEffect(() => {
    if (disableScrollIntoView) {
      return
    }
    const target = Array.from(carouselRef.current.children)[currentSlideIndex]
    carouselRef.current.style.scrollSnapType = 'none'
    scrollIntoView(
      target,
      {
        time: 300,
      },
      function () {
        carouselRef.current.style.scrollSnapType = 'x mandatory'
        setDisableScrollListener(false)
      },
    )
  }, [currentSlideIndex, disableScrollIntoView])

  const handleClick = (index) => {
    setDisableScrollIntoView(false)
    setDisableScrollListener(true)
    setCurrentSlideIndex(index)
  }

  const forwardDisabled = currentSlideIndex + 1 === items.length
  const backwardDisabled = currentSlideIndex === 0

  const clickAreaGradient = useMemo(
    () =>
      css({
        background: colorScheme.getCSSColor('fadeOutGradientDefault90'),
      }),
    [colorScheme],
  )
  return (
    <div {...styles.container}>
      <div
        {...styles.clickArea}
        {...clickAreaGradient}
        style={{
          left: '-1px',
          pointerEvents: backwardDisabled ? 'none' : undefined,
        }}
        onClick={() => handleClick(currentSlideIndex - 1)}
      >
        <svg
          style={{ display: backwardDisabled && 'none' }}
          width='16'
          height='40'
          viewBox='0 0 21 80'
          fill='none'
        >
          <path d='M18.5 1L3 41L18.5 79' stroke='white' strokeWidth='4' />
        </svg>
      </div>
      <div
        {...styles.clickArea}
        {...clickAreaGradient}
        style={{
          right: '-1px',
          pointerEvents: forwardDisabled ? 'none' : undefined,
          transform: 'rotate(-180deg)',
        }}
        onClick={() => handleClick(currentSlideIndex + 1)}
      >
        <svg
          style={{
            display: forwardDisabled && 'none',
          }}
          width='16'
          height='40'
          viewBox='0 0 21 80'
          fill='none'
        >
          <path d='M18.5 1L3 41L18.5 79' stroke='white' strokeWidth='4' />
        </svg>
      </div>
      <div {...styles.carousel} ref={carouselRef}>
        {items.map((d, i) => (
          <div {...styles.slide} onClick={() => handleClick(i)} key={i}>
            <img {...styles.image} src={d.src} />
            <div {...styles.actions}>
              <IconButton
                href={d.path}
                Icon={ArticleIcon}
                labelShort='Lesen'
                label='Lesen'
              />
              <PlayAudio path={d.path} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: css({
    width: '100%',
    position: 'relative',
  }),
  carousel: css({
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    display: 'flex',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    '::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  controls: css({}),
  slide: css({
    scrollSnapAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'space-around',
    minWidth: '88%',
    position: 'relative',
    zIndex: 1,
    paddingLeft: 15,
    '&:last-child': {
      paddingRight: 15,
    },
  }),
  image: css({
    width: '100%',
    userSelect: 'none',
  }),
  actions: css({
    marginTop: '16px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    userSelect: 'none',
  }),
  clickArea: css({
    position: 'absolute',
    cursor: 'pointer',
    width: 30,
    background: 'yellow',
    height: '100%',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
}

export default Carousel
