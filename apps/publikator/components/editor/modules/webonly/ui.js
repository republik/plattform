import { Label } from '@project-r/styleguide'
import withT from '../../../../lib/withT'

import { buttonStyles } from '../../utils'

import injectBlock from '../../utils/injectBlock'
import { webOnlyTemplate } from './mdastTemplates'

const blockFactories = {
  webOnly: ({ context }) => {
    return context.rootSerializer
      .deserialize(webOnlyTemplate)
      .document.nodes.first()
      .nodes.first()
  },
}

const createForm = (options) =>
  withT(({ t, value, onChange }) => {
    const { TYPE, editorOptions } = options

    return (
      <div>
        <Label>Web-Only Block</Label>
      </div>
    )
  })

const createUI = ({ TYPE, editorOptions, context }) => {
  const { insertBlocks = [] } = editorOptions

  const Form = editorOptions.fields && createForm({ TYPE, editorOptions })
  const insertTypes = editorOptions.insertTypes || []

  const insertButtons = insertBlocks
    .map((insertBlock) => {
      const newBlock = blockFactories[insertBlock]
      return (
        newBlock &&
        withT(({ t, value, onChange }) => {
          const disabled =
            value.isBlurred ||
            !value.blocks.every((n) => insertTypes.includes(n.type))

          return (
            <span
              {...buttonStyles.insert}
              data-disabled={disabled}
              data-visible
              onMouseDown={(event) => {
                event.preventDefault()
                if (!disabled) {
                  const change = value.change()
                  change.call(injectBlock, newBlock({ context }))
                  return onChange(change)
                }
              }}
            >
              {t(`variable/insert/${insertBlock}`, undefined, insertBlock)}
            </span>
          )
        })
      )
    })
    .filter(Boolean)

  return {
    forms: [Form],
    insertButtons,
  }
}

export default createUI
