import { ReactNode } from 'react'

import { fontStyles, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import { token } from '@republik/theme/tokens'

const styles = {
  filterButton: css({
    border: 'none',
    padding: '8px 0',
    font: 'inherit',
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    ...fontStyles.sansSerifMedium,
  }),
}

type FilterButtonProps = {
  children?: ReactNode
  isActive?: boolean
  onClick: () => void
}

const FilterButton = ({ children, onClick, isActive }: FilterButtonProps) => {
  return (
    <button
      onClick={() => onClick()}
      {...styles.filterButton}
      style={{
        color: isActive
          ? token.var('colors.text')
          : token.var('colors.disabled'),
      }}
    >
      {children}
    </button>
  )
}

export default FilterButton
