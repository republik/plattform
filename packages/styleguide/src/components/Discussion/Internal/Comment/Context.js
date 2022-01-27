import React from 'react'
import { css } from 'glamor'
import { ellipsize } from '../../../../lib/styleMixins'
import { mUp } from '../../../../theme/mediaQueries'
import {
  sansSerifMedium14,
  sansSerifMedium16,
  sansSerifRegular14
} from '../../../Typography/styles'
import { convertStyleToRem } from '../../../Typography/utils'
import { useColorContext } from '../../../Colors/useColorContext'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center'
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%'
  }),
  title: css({
    ...ellipsize,
    ...convertStyleToRem(sansSerifMedium14),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium16),
      lineHeight: '20px'
    }
  }),
  description: css({
    ...ellipsize,
    ...convertStyleToRem(sansSerifRegular14)
  })
}

export const Context = ({ title, description }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.root}>
      <div {...styles.meta}>
        <div {...styles.title} {...colorScheme.set('color', 'text')}>
          {title}
        </div>
        {description && (
          <div {...styles.description} {...colorScheme.set('color', 'text')}>
            {description}
          </div>
        )}
      </div>
    </div>
  )
}
