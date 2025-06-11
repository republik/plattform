import React, { useEffect, useMemo, useRef, useState } from 'react'
import { IconButton, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import { getImgSrc } from '../Overview/utils'
import { useQuery } from '@apollo/client'
import { GET_DOCUMENT_AUDIO } from './graphql/DocumentAudio.graphql'
import { useAudioContext } from '../Audio/AudioProvider'
import scrollIntoView from 'scroll-into-view'
import { AudioPlayerLocations } from '../Audio/types/AudioActionTracking'
import {
  IconArticle,
  IconPauseCircle,
  IconPlayCircleOutline,
} from '@republik/icons'

export type CarouselProps = {
  carouselData: any
  onlyAudio?: boolean
  expandAudioPlayerOnPlayback?: boolean
}

type CarouselItem = {
  src: string
  path: string
}

const PlayAudio: React.FC<{
  path: string
  expandPlayerOnPlayback?: boolean
}> = ({ path, expandPlayerOnPlayback = true }) => {
  const { data } = useQuery(GET_DOCUMENT_AUDIO, { variables: { path } })
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
    setIsExpanded,
  } = useAudioContext()
  if (!data?.document) {
    return null
  }

  const { document } = data

  return (
    <IconButton
      onClick={(e) => {
        e.preventDefault()
        if (checkIfActivePlayerItem(document.id)) {
          toggleAudioPlayback()
        } else {
          toggleAudioPlayer(document, AudioPlayerLocations.MARKETING_FRONT)
          if (expandPlayerOnPlayback) {
            setIsExpanded(true)
          }
        }
      }}
      Icon={
        checkIfActivePlayerItem(document.id) && isPlaying
          ? IconPauseCircle
          : IconPlayCircleOutline
      }
      labelShort='Hören'
      label='Hören'
    />
  )
}

const Carousel: React.FC<CarouselProps> = ({
  carouselData,
  onlyAudio = false,
  expandAudioPlayerOnPlayback = true,
}) => {
  const items: CarouselItem[] = carouselData?.content?.children
    ?.map(({ identifier, children, data }) => {
      if (identifier === 'TEASERGROUP') {
        return children?.length > 0
          ? {
              src: getImgSrc(data, '/', 1200),
              path: children[0]?.data?.url,
            }
          : null
      }
      return {
        src: getImgSrc(data, '/', 1200),
        path: data.url,
      }
    })
    ?.filter(Boolean)

  const carouselRef = useRef<HTMLDivElement>(null)

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [disableScrollIntoView, setDisableScrollIntoView] = useState(true)
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
      carousel?.removeEventListener('scroll', onScroll)
    }
  }, [currentSlideIndex, disableScrollListener])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || disableScrollIntoView) {
      return
    }

    const target = Array.from(carousel.children)[currentSlideIndex]
    carousel.style.scrollSnapType = 'none'
    scrollIntoView(
      target,
      {
        time: 300,
      },
      () => {
        if (carousel) {
          carousel.style.scrollSnapType = 'x mandatory'
        }
        setDisableScrollListener(false)
      },
    )
  }, [currentSlideIndex, disableScrollIntoView])

  const handleClick = (index) => {
    setDisableScrollIntoView(false)
    setDisableScrollListener(true)
    setCurrentSlideIndex(index)
  }

  const forwardDisabled = currentSlideIndex + 1 === items?.length
  const backwardDisabled = currentSlideIndex === 0

  return (
    <div {...styles.container}>
      <div
        {...styles.clickArea}
        style={{
          left: '-1px',
          pointerEvents: backwardDisabled ? 'none' : undefined,
        }}
        onClick={() => handleClick(currentSlideIndex - 1)}
      >
        <svg
          style={{ display: backwardDisabled ? 'none' : undefined }}
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
        style={{
          right: '-1px',
          pointerEvents: forwardDisabled ? 'none' : undefined,
          transform: 'rotate(-180deg)',
        }}
        onClick={() => handleClick(currentSlideIndex + 1)}
      >
        <svg
          style={{
            display: forwardDisabled ? 'none' : undefined,
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
        {items?.map((d, i) => (
          <div {...styles.slide} onClick={() => handleClick(i)} key={d.path}>
            <img {...styles.image} src={d.src} />
            <div {...styles.actions}>
              {!onlyAudio && (
                <IconButton
                  href={d.path}
                  Icon={IconArticle}
                  labelShort='Lesen'
                  label='Lesen'
                />
              )}
              <PlayAudio
                path={d.path}
                expandPlayerOnPlayback={expandAudioPlayerOnPlayback}
              />
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
    background: 'var(--color-fadeOutGradientDefault90)',
    height: '100%',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
}

export default Carousel
