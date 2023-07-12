import { Label, Field } from '@project-r/styleguide'
import { IconLens } from '@republik/icons'

import withT from '../../../../lib/withT'

import UIForm from '../../UIForm'
import { createInlineButton, matchInline, buttonStyles } from '../../utils'
import createOnFieldChange from '../../utils/createOnFieldChange'

const createForm =
  ({ TYPE }) =>
  ({ value, onChange }) => {
    if (!value.inlines.some(matchInline(TYPE))) {
      return null
    }
    return (
      <div>
        <Label>Color Label</Label>
        <LinkForm
          TYPE={TYPE}
          nodes={value.inlines.filter(matchInline(TYPE))}
          value={value}
          onChange={onChange}
        />
      </div>
    )
  }

export const LinkForm = withT(({ nodes, value, onChange, t }) => {
  const handlerFactory = createOnFieldChange(onChange, value)

  return (
    <>
      {nodes.map((node, i) => {
        const onInputChange = handlerFactory(node)
        return (
          <UIForm key={`color-label-form-${i}`}>
            <Field
              label='Color'
              value={node.data.get('color')}
              onChange={onInputChange('color')}
            />
          </UIForm>
        )
      })}
    </>
  )
})

const createColorLabel = ({ TYPE }) =>
  createInlineButton({
    type: TYPE,
  })(({ active, disabled, visible, ...props }) => {
    return (
      <span
        {...buttonStyles.mark}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
      >
        <IconLens size={14} />
      </span>
    )
  })

export default (options) => {
  return {
    forms: [createForm(options)],
    textFormatButtons: [createColorLabel(options)],
  }
}
