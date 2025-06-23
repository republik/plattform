import { Crop } from '#graphql/republik-api/__generated__/gql/graphql'
import { css } from '@republik/theme/css'
import React from 'react'
import { getImageCropURL } from './getImageCropURL'

type SquareCoverProps = {
  cover?: string
  size: number
  image?: string
  crop?: Crop
  title: string
}

export const SquareCover = ({
  cover,
  size,
  image: imageUrl,
  crop,
  title,
}: SquareCoverProps) => {
  return (
    <img
      className={css({
        aspectRatio: '1/1',
        objectFit: 'cover',
        height: 'auto',
      })}
      src={cover || getImageCropURL(imageUrl, size * 2, crop)}
      style={{ width: size }}
      alt={`cover for ${title}`}
    />
  )
}
