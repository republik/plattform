import { ReactNode } from 'react'

import { fontStyles, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  filterButton: css({
    border: 'none',
    padding: 0,
    font: 'inherit',
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    ...fontStyles.sansSerifBold,
    fontWeight: 'bold',
  }),
}

type FilterButtonProps = {
  children?: ReactNode
  isActive?: boolean
  onClick: () => void
}

const FilterButton = ({ children, onClick, isActive }: FilterButtonProps) => {
  const [colorScheme] = useColorContext()
  return (
    <button
      onClick={() => onClick()}
      {...styles.filterButton}
      {...colorScheme.set('color', isActive ? 'text' : 'disabled')}
    >
      {children}
    </button>
  )
}

export default FilterButton
