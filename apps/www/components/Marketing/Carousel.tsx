import React from 'react'
import {
  mediaQueries,
  IconButton,
  PlayCircleIcon,
  ArticleIcon,
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
  const currentItem = items[0]
  return (
    <div {...styles.carousel}>
      <div {...styles.image}>
        <img src={currentItem.src} width='100%' />
      </div>
      <div {...styles.actions}>
        <IconButton
          href={currentItem.path}
          Icon={ArticleIcon}
          labelStyle={{ fontSize: 24 }}
          fillColorName='default'
          labelShort='Lesen'
          label='Lesen'
          size={30}
        />
        <PlayAudio path={currentItem.path} />
      </div>
    </div>
  )
}

const styles = {
  image: css({
    width: '100%',
    padding: '20px 80px',
  }),
  carousel: css({
    width: '100%',
    [mediaQueries.mUp]: {
      width: '80%',
    },
  }),
  actions: css({
    display: 'flex',
    justifyContent: 'center',
  }),
}

export default Carousel
