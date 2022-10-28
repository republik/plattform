import React, { useEffect } from 'react'
import {
  mediaQueries,
  IconButton,
  PlayCircleIcon,
  ArticleIcon,
  colors,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { getImgSrc } from '../Overview/utils'
import { useQuery } from '@apollo/client'
import { GET_DOCUMENT_AUDIO } from './graphql/DocumentAudio.graphql'
import { trackEvent } from '../../lib/matomo'
import { useAudioContext } from '../Audio/AudioProvider'
import { calcLength } from 'framer-motion'

export type CarouselProps = { carouselData: any }

type CarouselItem = {
  src: string
  path: string
}

const PlayAudio: React.FC<{ path: string }> = ({ path }) => {
  const { data } = useQuery(GET_DOCUMENT_AUDIO, { variables: { path } })
  const { toggleAudioPlayer, isPlaying } = useAudioContext()

  if (!data?.document) return null
  return (
    <IconButton
      onClick={(e) => {
        e.preventDefault()
        trackEvent(['Marketing', 'play', data.document.id])
        toggleAudioPlayer(data.document)
      }}
      Icon={PlayCircleIcon}
      labelStyle={{ fontSize: 24 }}
      fillColorName='default'
      labelShort='Hören'
      label='Hören'
      size={30}
      disabled={isPlaying}
    />
  )
}

const Carousel: React.FC<CarouselProps> = ({ carouselData }) => {
  const items: CarouselItem[] = carouselData?.content?.children?.map(
    ({ data }) => ({
      src: getImgSrc(data, '/', 1200),
      path: data.url,
      ref: React.createRef(),
    }),
  )

  const moreItems = items.concat(items)

  const [currentPosition, setCurrentPosition] = React.useState(0)

  const translationStep = 100 / moreItems.length
  const maxTranslation = (moreItems.length - 1) * translationStep

  const handleClick = (type) => {
    if (type === 'forward') {
      setCurrentPosition(
        currentPosition >= maxTranslation
          ? maxTranslation
          : currentPosition + translationStep,
      )
    }
    if (type === 'backward') {
      setCurrentPosition(
        currentPosition <= 0 ? 0 : currentPosition - translationStep,
      )
    }
  }

  console.log(currentPosition)

  return (
    <div>
      <div {...styles.slider}>
        <div
          {...styles.clickArea}
          style={{ left: '0' }}
          onClick={() => handleClick('backward')}
        ></div>
        <div
          {...styles.clickArea}
          style={{ left: 'calc(100% - 50px)' }}
          onClick={() => handleClick('forward')}
        ></div>
        <ul
          {...styles.sliderWrapper}
          style={{ transform: `translateX(-${currentPosition}%)` }}
        >
          {moreItems.map((d, i) => (
            <li {...styles.slide} key={i}>
              <div {...styles.imageWrapper}>
                <img {...styles.image} src={d.src} />
                <div {...styles.actions}>
                  <IconButton
                    href={d.path}
                    Icon={ArticleIcon}
                    labelStyle={{ fontSize: 24 }}
                    fillColorName='default'
                    labelShort='Lesen'
                    label='Lesen'
                    size={30}
                  />
                  <PlayAudio path={d.path} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const SLIDER_HEIGHT = '35vmin'
const SLIDER_WIDTH = '40vmin'

const styles = {
  clickArea: css({
    position: 'absolute',
    width: '50px',
    backgroundColor: 'yellow', //colors.dark.default,
    height: '100%',
    zIndex: 2,
    opacity: 0.7,
  }),
  slider: css({
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto',
    height: SLIDER_HEIGHT,
    width: SLIDER_WIDTH,
  }),
  sliderWrapper: css({
    display: 'flex',
    position: 'absolute',
    transition: 'transform 500ms cubic-bezier(0.25, 1, 0.35, 1)',
    margin: '0 auto',
    listStyleType: 'none',
  }),
  slide: css({
    display: 'flex',
    height: SLIDER_HEIGHT,
    width: SLIDER_WIDTH,
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'space-around',
    zIndex: 1,
  }),
  imageWrapper: css({
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  }),
  image: css({
    width: '100%',
  }),
  actions: css({
    marginTop: '20px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  }),
}

export default Carousel
