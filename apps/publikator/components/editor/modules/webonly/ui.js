import { buttonStyles } from '../../utils'

import injectBlock from '../../utils/injectBlock'
import { webOnlyTemplate } from './mdastTemplates'

const createUI = ({ TYPE, editorOptions, context }) => {
  const { insertTypes = [] } = editorOptions || {}

  const buttonClickHandler = (disabled, value, onChange) => (event) => {
    event.preventDefault()
    if (!disabled) {
      return onChange(
        value
          .change()
          .call(
            injectBlock,
            context.rootSerializer
              .deserialize(webOnlyTemplate)
              .document.nodes.first()
              .nodes.first(),
          ),
      )
    }
  }

  const Button = ({ value, onChange }) => {
    const disabled =
      value.isBlurred ||
      !value.blocks.every((n) => insertTypes.includes(n.type))

    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={buttonClickHandler(disabled, value, onChange)}
      >
        Web-Only Block
      </span>
    )
  }

  return {
    insertButtons: [Button],
  }
}
export default createUI
