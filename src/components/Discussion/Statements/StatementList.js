import React from 'react'
import { css } from 'glamor'
import ColorContextHelper from './helpers/ColorContextHelper'
import { LoadMore } from '../Tree/LoadMore'

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
  moreAvailableCount
}) => (
  <ColorContextHelper tagMappings={tagMappings}>
    <div {...styles.wrapper}>
      {children}
      <LoadMore count={moreAvailableCount} t={t} onClick={loadMore} />
    </div>
  </ColorContextHelper>
)

export default StatementList
