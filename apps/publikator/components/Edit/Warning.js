import { css } from 'glamor'

import {
  colors,
  plainButtonRule,
  EDITOR_TOOLBAR_HEIGHT,
} from '@project-r/styleguide'
import MdClose from 'react-icons/lib/md/close'
import { HEADER_HEIGHT } from '../Frame/constants'

const styles = {
  warnings: css({
    position: 'fixed',
    right: 5,
    top: HEADER_HEIGHT + EDITOR_TOOLBAR_HEIGHT + 5,
    width: 300,
    zIndex: 22,
  }),
  warning: css({
    backgroundColor: colors.error,
    color: '#fff',
    marginBottom: 5,
    padding: '5px 25px 5px 5px',
    position: 'relative',
  }),
  time: css({
    marginRight: 5,
  }),
  remove: css(plainButtonRule, {
    position: 'absolute',
    right: 5,
    top: 0,
  }),
}

export const Warnings = ({ children }) => (
  <div {...styles.warnings}>{children}</div>
)

export const Warning = ({ warning, onRemove }) => {
  return (
    <div {...styles.warning}>
      <b {...styles.time}>{warning.time}</b> {warning.message}
      {onRemove && (
        <button {...styles.remove} onClick={onRemove}>
          <MdClose />
        </button>
      )}
    </div>
  )
}
