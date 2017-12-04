import { Radio, Label } from '@project-r/styleguide'

import {
  createActionButton,
  buttonStyles,
  createPropertyForm,
  matchBlock
} from '../../utils'

import SidebarForm from '../../SidebarForm'

import createOnFieldChange from '../../utils/createOnFieldChange'

import {
  createInsertDragSource
} from '../teaser/dnd'

import { getNewItem } from './'

const Form = ({ node, onChange }) => {
  return (
    <SidebarForm>

      <Radio
        value={2}
        checked={node.data.get('columns') === 2}
        onChange={event => onChange('columns', null, Number(event.target.value))}>
    2 Teaser
    </Radio>
      <br />
      <Radio
        value={1}
        checked={node.data.get('columns') === 1}
        onChange={event => onChange('columns', null, Number(event.target.value))}>
    1 Teaser
    </Radio>
    </SidebarForm>
  )
}

export const TeaserGroupForm = options => {
  const { TYPE } = options
  return createPropertyForm({
    isDisabled: ({ value }) => {
      const teaser = value.blocks.reduce(
      (memo, node) =>
        memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
      undefined
    )

      return !teaser
    }
  })(
    ({ disabled, onChange, value }) => {
      if (disabled) {
        return null
      }

      const teaser = value.blocks.reduce(
        (memo, node) =>
          memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
        undefined
      )

      const handlerFactory = createOnFieldChange(onChange, value, teaser)

      return <div>
        <Label>Teaser-Spalte</Label>
        <Form node={teaser} onChange={handlerFactory} />
      </div>
    }
  )
}

export const TeaserGroupButton = options => createActionButton({
  reducer: ({ value, onChange }) => event => {
  }
})(
  ({ disabled, children, visible, ...props }) => {
    const Component = createInsertDragSource(
      ({ connectDragSource }) =>
      connectDragSource(
        <span
          {...buttonStyles.insert}
          {...props}
          data-disabled={disabled}
          data-visible={visible}
          >
          {options.rule.editorOptions.insertButton}
        </span>
      )
    )
    return (
      <Component getNewItem={getNewItem(options)} />
    )
  }
)
