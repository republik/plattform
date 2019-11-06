import React from 'react'
import { Radio, Label } from '@project-r/styleguide'

import { buttonStyles, createPropertyForm, matchBlock } from '../../utils'

import injectBlock from '../../utils/injectBlock'

import UIForm from '../../UIForm'

import createOnFieldChange from '../../utils/createOnFieldChange'

import { getNewBlock } from './'

const addFigure = options => {
  const [figureModule] = options.subModules
  return (value, onChange, figureGroupNode) => event => {
    event.preventDefault()
    const index = figureGroupNode.nodes.findLastIndex(
      n => n.type === figureModule.TYPE
    )
    onChange(
      value
        .change()
        .insertNodeByKey(
          figureGroupNode.key,
          index + 1,
          figureModule.helpers.newBlock()
        )
    )
  }
}

const unwrapFigures = options => {
  const [figureModule] = options.subModules
  return (value, onChange, figureGroupNode) => event => {
    event.preventDefault()
    onChange(
      figureGroupNode.nodes
        .filter(n => n.type === figureModule.TYPE)
        .reduce((t, child) => t.unwrapNodeByKey(child.key), value.change())
        .removeNodeByKey(figureGroupNode.key)
    )
  }
}

const Form = ({ node, onChange }) => {
  return (
    <UIForm>
      <Radio
        value={4}
        checked={node.data.get('columns') === 4}
        onChange={event =>
          onChange('columns', null, Number(event.target.value))
        }
      >
        4 Spalten
      </Radio>
      <Radio
        value={3}
        checked={node.data.get('columns') === 3}
        onChange={event =>
          onChange('columns', null, Number(event.target.value))
        }
      >
        3 Spalten
      </Radio>
      <Radio
        value={2}
        checked={node.data.get('columns') === 2}
        onChange={event =>
          onChange('columns', null, Number(event.target.value))
        }
      >
        2 Spalten
      </Radio>
      <Radio
        value={1}
        checked={node.data.get('columns') === 1}
        onChange={event =>
          onChange('columns', null, Number(event.target.value))
        }
      >
        1 Spalte
      </Radio>
    </UIForm>
  )
}

export const FigureGroupForm = options => {
  const { TYPE } = options
  const addFigureHandler = addFigure(options)
  const unwrapFiguresHandler = unwrapFigures(options)
  return createPropertyForm({
    isDisabled: ({ value }) => {
      const figureGroup = value.blocks.reduce(
        (memo, node) =>
          memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
        undefined
      )

      return !figureGroup
    }
  })(({ disabled, onChange, value }) => {
    if (disabled) {
      return null
    }

    const figureGroup = value.blocks.reduce(
      (memo, node) =>
        memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
      undefined
    )

    const handlerFactory = createOnFieldChange(
      change => {
        onChange(change)
      },
      value,
      figureGroup
    )
    return (
      <div>
        <Label>Bildergruppe</Label>
        <Form node={figureGroup} onChange={handlerFactory} />
        <br />
        <Label>Diashow</Label>
        <UIForm>
          <Radio
            value={null}
            checked={!figureGroup.data.get('slideshow')}
            onChange={event => handlerFactory('slideshow', null, null)}
          >
            Keine
          </Radio>
          <Radio
            value={3}
            checked={figureGroup.data.get('slideshow') === 3}
            onChange={event =>
              handlerFactory('slideshow', null, Number(event.target.value))
            }
          >
            3 Zeilen Vorschau
          </Radio>
          <Radio
            value={2}
            checked={figureGroup.data.get('slideshow') === 2}
            onChange={event =>
              handlerFactory('slideshow', null, Number(event.target.value))
            }
          >
            2 Zeilen Vorschau
          </Radio>
          <Radio
            value={1}
            checked={figureGroup.data.get('slideshow') === 1}
            onChange={event =>
              handlerFactory('slideshow', null, Number(event.target.value))
            }
          >
            1 Zeile Vorschau
          </Radio>
        </UIForm>
        <p style={{ margin: '10px 0' }}>
          <Label>Ausrichtung</Label>
          <br />
          {[
            { label: 'Klein', size: 'narrow' },
            { label: 'Normal', size: 'normal' },
            { label: 'Gross', size: 'breakout' }
          ].map((size, i) => {
            const checked =
              figureGroup.data.get('size', 'breakout') === size.size

            return [
              <Radio
                key={`radio${i}`}
                checked={checked}
                onChange={event => {
                  event.preventDefault()
                  if (checked) return

                  let change = value.change().setNodeByKey(figureGroup.key, {
                    data: figureGroup.data.set('size', size.size)
                  })

                  onChange(change)
                }}
              >
                {size.label}
              </Radio>,
              <br key={`br${i}`} />
            ]
          })}
        </p>

        <span
          {...buttonStyles.insert}
          data-disabled={disabled}
          data-visible
          onMouseDown={addFigureHandler(value, onChange, figureGroup)}
        >
          Bild hinzufügen
        </span>
        <span
          {...buttonStyles.insert}
          data-disabled={disabled}
          data-visible
          onMouseDown={unwrapFiguresHandler(value, onChange, figureGroup)}
        >
          Bildergruppe auflösen
        </span>
      </div>
    )
  })
}

export const FigureGroupButton = options => {
  const figureButtonClickHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    if (!disabled) {
      onChange(value.change().call(injectBlock, getNewBlock(options)()))
    }
  }

  const insertTypes = options.rule.editorOptions.insertTypes || []
  return ({ value, onChange }) => {
    const disabled =
      value.isBlurred || !value.blocks.every(n => insertTypes.includes(n.type))
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={figureButtonClickHandler(disabled, value, onChange)}
      >
        {options.rule.editorOptions.insertButtonText}
      </span>
    )
  }
}
