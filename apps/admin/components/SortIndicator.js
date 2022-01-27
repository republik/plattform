import React from 'react'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'

const svgIcon = css({
  display: 'inline-flex',
  alignSelf: 'center',
  position: 'relatve',
  height: '1em',
  width: '1em',
  '& svg': {
    height: '1em',
    width: '1em',
    fill: colors.secondary
  }
})

const SortIndicator = ({ sortDirection }) => {
  return (
    <div className={`${svgIcon}`}>
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
      >
        {sortDirection === 'ASC' ? (
          <path d="M7 14l5-5 5 5z" />
        ) : (
          <path d="M7 10l5 5 5-5z" />
        )}
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
    </div>
  )
}

export default SortIndicator
