import React from 'react'

import { Label } from '@project-r/styleguide'
import { Map } from 'immutable'

import { matchBlock, createPropertyForm, buttonStyles } from '../../utils'

import { allBlocks, parent, childIndex, depth } from '../../utils/selection'

import MetaForm from '../../utils/MetaForm'

export default ({ TYPE, newBlock, rule = {}, zone }) => {
  const { editorOptions = {} } = rule

  const clickHandler = (value, onChange) => event => {
    event.preventDefault()
    const nodes = allBlocks(value)
      .filter(n => depth(value, n.key) < 2)
      .filter(n => {
        return ['teaser', 'teasergroup'].includes(n.data.get('module'))
      })
    const node = nodes.first()
    onChange(
      value
        .change()
        .insertNodeByKey(
          parent(value, node.key).key,
          childIndex(value, node.key),
          newBlock()
        )
    )
  }

  const InsertButton = ({ value, onChange }) => {
    const disabled = value.isBlurred || value.isExpanded
    if (value.document.nodes.find(zone.match)) {
      return null
    }
    return (
      <span
        {...buttonStyles.insert}
        data-visible
        data-disabled={disabled}
        onMouseDown={clickHandler(value, onChange)}
      >
        {editorOptions.insertButtonText}
      </span>
    )
  }

  const Form = ({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }
    return (
      <div>
        <Label>Live Teaser</Label>
        {value.blocks.filter(matchBlock(TYPE)).map((node, i) => {
          const onInputChange = key => (_, inputValue) => {
            onChange(
              value.change().setNodeByKey(node.key, {
                data: inputValue
                  ? node.data.set(key, inputValue)
                  : node.data.remove(key)
              })
            )
          }

          const { form = [] } = editorOptions

          return (
            <MetaForm
              key={`liveteaser-${i}`}
              data={Map(form.map(field => [field.key, ''])).merge(
                node.data
                  .remove('id')
                  .remove('module')
                  .remove('priorRepoIds')
              )}
              notes={Map(form.map(field => [field.key, field.note]))}
              onInputChange={onInputChange}
            />
          )
        })}
      </div>
    )
  }

  return {
    forms: [
      createPropertyForm({
        isDisabled: ({ value }) => {
          return !value.blocks.some(matchBlock(TYPE))
        }
      })(Form)
    ],
    insertButtons: editorOptions.insertButtonText ? [InsertButton] : []
  }
}
