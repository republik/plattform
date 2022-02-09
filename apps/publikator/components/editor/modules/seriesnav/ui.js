import React from 'react'
import { buttonStyles, createPropertyForm, matchBlock } from '../../utils'
import { Checkbox, Label } from '@project-r/styleguide'

import { allBlocks, parent, childIndex, depth } from '../../utils/selection'

import UIForm from '../../UIForm'

import { isSeriesOverview } from './utils'

const createSeriesNavUI = ({ TYPE, newBlock, zone }) => {
  const SeriesNavButton = ({ value, onChange }) => {
    const insertTypes = ['PARAGRAPH']
    const disabled =
      value.isBlurred ||
      !value.blocks.every((n) => insertTypes.includes(n.type)) ||
      !value.document.data.get('series')
    const clickHandler = (event) => {
      event.preventDefault()
      if (!disabled) {
        const blocks = allBlocks(value)
        const rootBlocks = blocks.filter((n) => depth(value, n.key) === 1)

        const currentBlock = blocks.first()
        const currentRootBlock = rootBlocks.first()

        const isOverview = isSeriesOverview(value.document)

        onChange(
          value
            .change()
            .splitBlockAtRange(
              value.selection,
              depth(value, currentBlock.key),
              {
                normalize: false,
              },
            )
            .insertNodeByKey(
              parent(value, currentRootBlock.key).key,
              childIndex(value, currentRootBlock.key) + 1,
              newBlock(
                value.document.data.toJS(),
                isOverview ? { grid: true } : undefined,
              ),
            ),
        )
      }
    }

    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={clickHandler}
      >
        Serien Navigation
      </span>
    )
  }

  const SeriesNavForm = ({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }
    const node = value.blocks.find(zone.match)
    if (!node) {
      return null
    }
    const onGridChange = (_, checked) => {
      onChange(
        value.change().setNodeByKey(node.key, {
          data: node.data.set('grid', checked),
        }),
      )
    }

    return (
      <UIForm>
        <Label>Layout</Label>
        <Checkbox checked={node.data.get('grid')} onChange={onGridChange}>
          Grid
        </Checkbox>
      </UIForm>
    )
  }
  const SpecialForm = createPropertyForm({
    isDisabled: ({ value }) => {
      return !value.blocks.some(matchBlock(TYPE))
    },
  })(SeriesNavForm)

  return {
    forms: [SpecialForm],
    insertButtons: [SeriesNavButton],
  }
}

export default createSeriesNavUI
