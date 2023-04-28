import { css } from 'glamor'

import { colors, plainButtonRule } from '@project-r/styleguide'
import { IconClose } from '@republik/icons'

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
          <IconClose />
        </button>
      )}
    </div>
  )
}

export default Warning
