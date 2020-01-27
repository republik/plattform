import React from 'react'
import { css } from 'glamor'
import { sansSerifMedium16 } from '../../../Typography/styles'
import colors from '../../../../theme/colors'

const styles = {
  text: css({
    display: 'inline-block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    verticalAlign: 'middle',
    color: colors.primary,
    marginTop: -1,
    paddingLeft: 4,
    ...sansSerifMedium16
  }),
  icon: css({
    display: 'inline-block',
    marginBottom: -2,
    verticalAlign: 'middle'
  })
}

const Icon = ({ size, fill }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    style={{ verticalAlign: 'middle' }}
  >
    <path
      d='M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10Z'
      fill={fill}
    />
  </svg>
)

export default ({ count, small }) => {
  const size = small ? 18 : 24
  const fontSize = small ? '14px' : undefined
  const lineHeight = small ? '17px' : undefined

  return (
    <>
      <span {...styles.icon}>
        <Icon size={size} fill={colors.primary} />
      </span>
      {count > 0 && (
        <span {...styles.text} style={{ fontSize, lineHeight }}>
          {count}
        </span>
      )}
    </>
  )
}
