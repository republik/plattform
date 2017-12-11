import { buttonStyles } from '../../utils'

const doubleGuillemetClickHandler = (value, onChange) => event => {
  event.preventDefault()
  return onChange(
    value
      .change()
      .wrapText('«', '»')
  )
}

const DoubleGuillemetButton = ({ value, onChange }) => {
  const disabled = value.isBlurred || value.isCollapsed
  return <span
    {...buttonStyles.insert}
    data-disabled={disabled}
    data-visible
    onMouseDown={doubleGuillemetClickHandler(value, onChange)}
      >
    {'«»'}
  </span>
}

const singleGuillemetClickHandler = (value, onChange) => event => {
  event.preventDefault()
  return onChange(
    value
      .change()
      .wrapText('‹', '›')
  )
}

const SingleGuillemetButton = ({ value, onChange }) => {
  const disabled = value.isBlurred || value.isCollapsed
  return <span
    {...buttonStyles.insert}
    data-disabled={disabled}
    data-visible
    onMouseDown={singleGuillemetClickHandler(value, onChange)}
      >
    {'‹›'}
  </span>
}

const longDashClickHandler = (value, onChange) => event => {
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

const LongDashButton = ({ value, onChange }) => {
  const disabled = value.isBlurred || value.isCollapsed
  return <span
    {...buttonStyles.insert}
    data-disabled={disabled}
    data-visible
    onMouseDown={longDashClickHandler(value, onChange)}
      >
    {'‹›'}
  </span>
}

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
