import React from 'react'
import { css } from 'glamor'
import ColorContextHelper from './helpers/ColorContextHelper'
import { LoadMore } from '../Tree/LoadMore'
import PropTypes from 'prop-types'
import { useColorContext } from '../../Colors/ColorContext'

const styles = {
  wrapper: css({
    marginTop: '1rem',
    '& > div:not(:first-child)': {
      marginTop: '2rem'
    }
  })
}

const StatementList = ({
  children,
  tagMappings,
  t,
  loadMore,
  moreAvailableCount,
  focusError
}) => {
  const [colorScheme] = useColorContext()

  return (
    <ColorContextHelper tagMappings={tagMappings}>
      <div {...styles.wrapper}>
        {focusError && (
          <p {...colorScheme.set('color', 'error')}>{focusError}</p>
        )}
        {children}
        <LoadMore count={moreAvailableCount} t={t} onClick={loadMore} />
      </div>
    </ColorContextHelper>
  )
}

export default StatementList

StatementList.propTypes = {
  children: PropTypes.node,
  tagMappings: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  moreAvailableCount: PropTypes.number.isRequired,
  focusError: PropTypes.string
}
