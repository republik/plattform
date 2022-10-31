import React from 'react'
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
    }),
  )

  const [currentPosition, setCurrentPosition] = React.useState(0)

  const translationStep = 100 / items.length
  const maxTranslation = (items.length - 1) * translationStep

  const handleClick = (type) => {
    const direction = type === 'forward' ? 1 : -1
    setCurrentPosition(currentPosition + translationStep * direction)
  }

  const forwardDisabled = currentPosition >= maxTranslation
  const backwardDisabled = currentPosition <= 0

  return (
    <div>
      <div {...styles.slider}>
        <div
          {...styles.clickArea}
          style={{
            left: '0',
            backgroundColor: backwardDisabled && 'red',
            pointerEvents: backwardDisabled && 'none',
          }}
          onClick={() => handleClick('backward')}
        ></div>
        <div
          {...styles.clickArea}
          style={{
            left: `calc(100% - ${SLIDE_MARGIN})`,
            backgroundColor: forwardDisabled && 'red',
            pointerEvents: forwardDisabled && 'none',
          }}
          onClick={() => handleClick('forward')}
        ></div>
        <ul
          {...styles.sliderWrapper}
          style={{ transform: `translateX(-${currentPosition}%)` }}
        >
          {items.map((d, i) => (
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
const SLIDER_WIDTH = '50vmin'
const SLIDE_WIDTH = '40vmin'
const SLIDE_MARGIN = '4vmin'

const styles = {
  clickArea: css({
    position: 'absolute',
    width: SLIDE_MARGIN,
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
    top: 0,
    left: 0,
    listStyleType: 'none',
    margin: '0 auto',
    padding: 0,
    marginLeft: '1vmin',
  }),
  slide: css({
    display: 'flex',
    height: SLIDER_HEIGHT,
    width: SLIDE_WIDTH,
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'space-around',
    zIndex: 1,
    marginLeft: SLIDE_MARGIN,
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
    userSelect: 'none',
  }),
  actions: css({
    marginTop: '20px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    userSelect: 'none',
  }),
}

export default Carousel
