import React from 'react'
import { css } from 'glamor'
import ColorContextHelper from './helpers/ColorContextHelper'
import StatementNode from './StatementNode'
import { LoadMore } from '../Tree/LoadMore'

const styles = {
  wrapper: css({
    '& > div:not(:last-child)': {
      marginBottom: '2rem'
    }
  })
}

const StatementList = ({
  comments,
  tagMappings,
  t,
  actions,
  disableVoting,
  loadMore,
  moreAvailableCount
}) => (
  <ColorContextHelper tagMappings={tagMappings}>
    <div {...styles.wrapper}>
      {comments?.length > 0 &&
        comments.map(pleading => (
          <div key={pleading.id}>
            <StatementNode
              comment={pleading}
              tagMappings={tagMappings}
              t={t}
              actions={actions}
              disableVoting={disableVoting}
            />
          </div>
        ))}
      <LoadMore count={moreAvailableCount} t={t} onClick={loadMore} />
    </div>
  </ColorContextHelper>
)

export default StatementList
