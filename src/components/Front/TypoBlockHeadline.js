import React from 'react'
import { css } from 'glamor'
import { mUp, tUp, dUp } from './mediaQueries'
import { serifTitle20, sansSerifMedium20 } from '../Typography/styles'

const serifSizes = {
  large: css({
    [tUp]: {
      fontSize: '165px',
      lineHeight: '175px'
    },
    [dUp]: {
      fontSize: '205px',
      lineHeight: '215px'
    }
  }),
  medium: css({
    [tUp]: {
      fontSize: '165px',
      lineHeight: '175px'
    }
  }),
  default: css({
    fontSize: '38px',
    lineHeight: '43px',
    [mUp]: {
      fontSize: '125px',
      lineHeight: '135px'
    }
  })
}

const sansSerifSizes = {
  large: css({
    [tUp]: {
      fontSize: '157px',
      lineHeight: '175px'
    },
    [dUp]: {
      fontSize: '195px',
      lineHeight: '215px'
    }
  }),
  medium: css({
    [tUp]: {
      fontSize: '157px',
      lineHeight: '175px'
    }
  }),
  default: css({
    fontSize: '38px',
    lineHeight: '43px',
    [mUp]: {
      fontSize: '120px',
      lineHeight: '135px'
    }
  })
}

const styles = {
  base: css({
    margin: '0 0 15px 0',
    [mUp]: {
      marginBottom: '30px'
    }
  }),
  editorial: css({
    ...serifTitle20,
  }),
  interaction: css({
    ...sansSerifMedium20
  })
}

export const Editorial = ({ children, large, medium }) => {
  const sizedStyle = css(
    styles.editorial,
    serifSizes.default,
    (large && serifSizes.large) || (medium && serifSizes.medium) || {}
  )
  return (
    <h1 {...styles.base} {...sizedStyle}>
      {children}
    </h1>
  )
}

export const Interaction = ({ children, large, medium }) => {
  const sizedStyle = css(
    styles.interaction,
    sansSerifSizes.default,
    (large && sansSerifSizes.large) || (medium && sansSerifSizes.medium) || {}
  )
  return (
    <h1 {...styles.base} {...sizedStyle}>
      {children}
    </h1>
  )
}
