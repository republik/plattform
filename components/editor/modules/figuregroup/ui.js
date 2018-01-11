import { Radio, Label } from '@project-r/styleguide'

import {
  buttonStyles,
  createPropertyForm,
  matchBlock
} from '../../utils'

import injectBlock from '../../utils/injectBlock'

import UIForm from '../../UIForm'

import createOnFieldChange from '../../utils/createOnFieldChange'

import { getNewBlock } from './'

const addFigure = options => {
  const [
    figureModule
  ] = options.subModules
  return (value, onChange, figureGroupNode) => event => {
    event.preventDefault()
    const index = figureGroupNode.nodes.findLastIndex(n => n.type === figureModule.TYPE)
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
  const [
    figureModule
  ] = options.subModules
  return (value, onChange, figureGroupNode) => event => {
    event.preventDefault()
    onChange(
      figureGroupNode.nodes.filter(n => n.type === figureModule.TYPE).reduce(
        (t, child) => t.unwrapNodeByKey(child.key),
        value.change()
      ).removeNodeByKey(figureGroupNode.key)
    )
  }
}

const Form = ({ node, onChange }) => {
  return (
    <UIForm>
      <Radio
        value={4}
        checked={node.data.get('columns') === 4}
        onChange={event => onChange('columns', null, Number(event.target.value))}>
      4 Spalten
      </Radio>
      <Radio
        value={3}
        checked={node.data.get('columns') === 3}
        onChange={event => onChange('columns', null, Number(event.target.value))}>
      3 Spalten
      </Radio>
      <Radio
        value={2}
        checked={node.data.get('columns') === 2}
        onChange={event => onChange('columns', null, Number(event.target.value))}>
      2 Spalten
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
  })(
    ({ disabled, onChange, value }) => {
      if (disabled) {
        return null
      }

      const figureGroup = value.blocks.reduce(
        (memo, node) =>
          memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
        undefined
      )

      const handlerFactory = createOnFieldChange((change) => {
        onChange(change)
      }, value, figureGroup)
      return <div>
        <Label>Bildergruppe</Label>
        <Form node={figureGroup} onChange={handlerFactory} />
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
    }
  )
}

export const FigureGroupButton = options => {
  const figureButtonClickHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    if (!disabled) {
      onChange(value
        .change()
        .call(
          injectBlock,
          getNewBlock(options)()
        )
      )
    }
  }

  const insertTypes = options.rule.editorOptions.insertTypes || []
  return ({ value, onChange }) => {
    const disabled = value.isBlurred ||
      !value.blocks.every(
        n => insertTypes.includes(n.type)
      )
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
