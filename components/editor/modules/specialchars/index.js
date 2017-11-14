import { createActionButton, buttonStyles } from '../../utils'

const DoubleGuillemetButton = createActionButton({
  isDisabled: ({ value }) => {
    return value.isBlurred || value.isCollapsed
  },
  reducer: ({ value, onChange }) => event => {
    event.preventDefault()

    return onChange(
    value
      .change()
      .wrapText('«', '»')
  )
  }
})(
({ disabled, visible, ...props }) =>
  <span
    {...buttonStyles.insert}
    {...props}
    data-disabled={disabled}
    data-visible={visible}
    >
    {'«»'}
  </span>
)

const SingleGuillemetButton = createActionButton({
  isDisabled: ({ value }) => {
    return value.isBlurred || value.isCollapsed
  },
  reducer: ({ value, onChange }) => event => {
    event.preventDefault()
    return onChange(
      value
        .change()
        .wrapText('‹', '›')
    )
  }
})(
({ disabled, visible, ...props }) =>
  <span
    {...buttonStyles.insert}
    {...props}
    data-disabled={disabled}
    data-visible={visible}
    >
    {'‹›'}
  </span>
)

const LongDashButton = createActionButton({
  isDisabled: ({ value }) => {
    return value.isBlurred
  },
  reducer: ({ value, onChange }) => event => {
    event.preventDefault()

    return onChange(
      !value.isCollapsed
        ? value
            .change()
            .wrapText(' – ', ' – ')
        : value
            .change()
            .insertText(' – ')
  )
  }
})(
({ disabled, visible, ...props }) =>
  <span
    {...buttonStyles.insert}
    {...props}
    data-disabled={disabled}
    data-visible={visible}
    >
    {'–'}
  </span>
)

export default ({ TYPE }) => ({
  TYPE,
  helpers: {
  },
  changes: {},
  plugins: [],
  ui: {
    insertButtons: [
      DoubleGuillemetButton,
      SingleGuillemetButton,
      LongDashButton
    ]
  }
})
