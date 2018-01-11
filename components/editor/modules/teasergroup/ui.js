import { Radio, Label } from '@project-r/styleguide'

import {
  buttonStyles,
  createPropertyForm,
  matchBlock
} from '../../utils'

import UIForm from '../../UIForm'

import createOnFieldChange from '../../utils/createOnFieldChange'

import { allBlocks, parent, childIndex } from '../../utils/selection'

import { getNewBlock } from './'

const Form = ({ node, onChange }) => {
  return (
    <UIForm>

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
    </UIForm>
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

export const TeaserGroupButton = options => {
  const mouseDownHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    const nodes = allBlocks(value).filter(n => {
      return n.data.get('module') === 'teaser'
    })
    const node = nodes.first()
    if (node) {
      onChange(
        value.change().insertNodeByKey(
          parent(value, node.key).key,
          childIndex(value, node.key),
          getNewBlock(options)()
        )
      )
    }
  }

  return ({ value, onChange }) => {
    const disabled = value.isBlurred
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={mouseDownHandler(disabled, value, onChange)}
          >
        {options.rule.editorOptions.insertButton}
      </span>
    )
  }
}
