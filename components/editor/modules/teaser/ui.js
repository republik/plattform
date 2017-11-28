import { colors } from '@project-r/styleguide'
import React from 'react'

import {
  createActionButton,
  buttonStyles
} from '../../utils'

import {
  createInsertDragSource,
  createDropTarget,
  createMoveDragSource
} from './dnd'

const styles = {
  hint: {
    position: 'absolute',
    margin: 0,
    // top: 0,
    // left: 0,
    // right: 0,
    borderTop: `1px dashed ${colors.primary}`
  }
}

export const TeaserButton = createActionButton({
  reducer: ({ value, onChange }) => event => {
  }
})(
  ({ disabled, visible, getNewItem, ...props }) => {
    const Component = createInsertDragSource(
      ({ connectDragSource }) =>
      connectDragSource(
        <span
          {...buttonStyles.insert}
          {...props}
          data-disabled={disabled}
          data-visible={visible}
          >
          Teaser
        </span>
      )
    )
    return (
      <Component getNewItem={getNewItem} />
    )
  }
)

export const TeaserInlineUI = createDropTarget(createMoveDragSource(
  ({ connectDragSource, connectDropTarget, isOver, children }) => {
    const dragSource = connectDragSource(
      <span contentEditable={false}>Dragme</span>)
    const dropTarget = connectDropTarget(
      <div> {
        children
      } </div>
    )

    return (
      <div style={{position: 'relative'}}>
        { isOver && <hr style={styles.hr} />}
        {dragSource}
        {dropTarget}
      </div>
    )
  }
))
