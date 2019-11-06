import React from 'react'
import { buttonStyles } from '../../utils'
import invisibleDecoratorPlugin from './invisibleDecoratorPlugin'

const doubleGuillemetClickHandler = (value, onChange) => event => {
  event.preventDefault()
  return onChange(value.change().wrapText('«', '»'))
}

const DoubleGuillemetButton = ({ value, onChange }) => {
  const disabled = value.isBlurred || value.isCollapsed
  return (
    <span
      {...buttonStyles.insert}
      data-disabled={disabled}
      data-visible
      onMouseDown={doubleGuillemetClickHandler(value, onChange)}
    >
      {'«»'}
    </span>
  )
}

const singleGuillemetClickHandler = (value, onChange) => event => {
  event.preventDefault()
  return onChange(value.change().wrapText('‹', '›'))
}

const SingleGuillemetButton = ({ value, onChange }) => {
  const disabled = value.isBlurred || value.isCollapsed
  return (
    <span
      {...buttonStyles.insert}
      data-disabled={disabled}
      data-visible
      onMouseDown={singleGuillemetClickHandler(value, onChange)}
    >
      {'‹›'}
    </span>
  )
}

const ensureSpace = char => (char && char.text.match(/\s/) ? '' : ' ')

const longDashClickHandler = (value, onChange) => event => {
  event.preventDefault()

  const before = ensureSpace(
    value.startText.characters.get(value.selection.startOffset - 1)
  )

  const after = ensureSpace(
    value.endText.characters.get(value.selection.endOffset)
  )

  if (value.isCollapsed) {
    return onChange(value.change().insertText(`${before}–${after}`))
  }

  const innerBefore = ensureSpace(
    value.startText.characters.get(value.selection.startOffset)
  )

  const innerAfter = ensureSpace(
    value.endText.characters.get(value.selection.endOffset - 1)
  )

  return onChange(
    value
      .change()
      .wrapText(`${before}–${innerBefore}`, `${innerAfter}–${after}`)
  )
}

const LongDashButton = ({ value, onChange }) => {
  const disabled = value.isBlurred
  return (
    <span
      {...buttonStyles.insert}
      data-disabled={disabled}
      data-visible
      onMouseDown={longDashClickHandler(value, onChange)}
    >
      {'–'}
    </span>
  )
}

const nbspClickHandler = (value, onChange) => event => {
  event.preventDefault()

  return onChange(value.change().insertText('\u00a0'))
}

const NBSPButton = ({ value, onChange }) => {
  const disabled = value.isBlurred
  return (
    <span
      {...buttonStyles.insert}
      data-disabled={disabled}
      data-visible
      onMouseDown={nbspClickHandler(value, onChange)}
    >
      Dauerleerzeichen (␣)
    </span>
  )
}

const softHyphenClickHandler = (value, onChange) => event => {
  event.preventDefault()

  return onChange(value.change().insertText('\u00ad'))
}

const SoftHyphenButton = ({ value, onChange }) => {
  const disabled = value.isBlurred
  return (
    <span
      {...buttonStyles.insert}
      data-disabled={disabled}
      data-visible
      onMouseDown={softHyphenClickHandler(value, onChange)}
    >
      Weiches Trennzeichen (‧)
    </span>
  )
}

export default ({ TYPE }) => ({
  TYPE,
  helpers: {},
  changes: {},
  plugins: [invisibleDecoratorPlugin()],
  ui: {
    insertButtons: [
      DoubleGuillemetButton,
      SingleGuillemetButton,
      LongDashButton,
      NBSPButton,
      SoftHyphenButton
    ]
  }
})
