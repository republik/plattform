import React from 'react'
import { css } from 'glamor'

import { colors, plainButtonRule } from '@project-r/styleguide'
import MdClose from 'react-icons/lib/md/close'

const styles = {
  warning: css({
    backgroundColor: colors.error,
    color: '#fff',
    marginBottom: 10,
    padding: 10,
    position: 'relative',
  }),
  remove: css(plainButtonRule, {
    position: 'absolute',
    right: 5,
    top: 3,
  }),
}

const Warning = ({ message, onRemove }) => {
  return (
    <div {...styles.warning}>
      {message}
      {onRemove && (
        <button {...styles.remove} onClick={onRemove}>
          <MdClose />
        </button>
      )}
    </div>
  )
}

export default Warning
