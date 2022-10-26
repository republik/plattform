import React from 'react'
import {
  mediaQueries,
  IconButton,
  PlayCircleIcon,
  ArticleIcon,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { getImgSrc } from '../Overview/utils'

export type CarouselProps = { carouselData: any }

const Carousel: React.FC<CarouselProps> = ({ carouselData }) => {
  const images = carouselData?.content?.children?.map(({ data }) =>
    getImgSrc(data, '/', 1200),
  )
  return (
    <div {...styles.carousel}>
      <div {...styles.image}>
        <img src={images[0]} width='100%' />
      </div>
      <div {...styles.actions}>
        <IconButton
          onClick={() => undefined}
          Icon={PlayCircleIcon}
          labelStyle={{ fontSize: 24 }}
          fillColorName='default'
          labelShort='Hören'
          label='Hören'
          size={30}
        />
        <IconButton
          onClick={() => undefined}
          Icon={ArticleIcon}
          labelStyle={{ fontSize: 24 }}
          fillColorName='default'
          labelShort='Lesen'
          label='Lesen'
          size={30}
        />
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
