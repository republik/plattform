import React from 'react'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'

const styles = {
  list: css({
    listStyleType: 'none',
    margin: 0,
    maxHeight: '300px',
    overflow: 'scroll',
    padding: 0
  }),
  change: css({
    borderBottom: `1px solid ${colors.divider}`,
    fontSize: '11px',
    padding: '5px 0',
    position: 'relative'
  }),
  empty: css({
    fontSize: '13px',
    padding: '10px',
    textAlign: 'center'
  })
}

const UncommittedChanges = ({ uncommittedChanges }) => {
  if (uncommittedChanges.length) {
    return (
      <div>
        <ul {...styles.list}>
          {uncommittedChanges.map(change =>
            <li key={change.id} {...styles.change}>
              {change.email}
            </li>
          )}
        </ul>
      </div>
    )
  } else {
    return <div {...styles.empty}>No one!</div>
  }
}

export default UncommittedChanges
