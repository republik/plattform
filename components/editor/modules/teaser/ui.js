import { colors, Dropdown, Checkbox, Label } from '@project-r/styleguide'
import React from 'react'
import ArrowsIcon from 'react-icons/lib/fa/arrows'
import { css } from 'glamor'
import {
  createActionButton,
  buttonStyles,
  createPropertyForm,
  matchBlock
} from '../../utils'

import { getNewItem } from './'

import SidebarForm from '../../SidebarForm'
import ImageInput from '../../utils/ImageInput'
import ColorPicker from '../../utils/ColorPicker'
import createOnFieldChange from '../../utils/createOnFieldChange'

import {
  createInsertDragSource,
  createDropTarget,
  createMoveDragSource
} from './dnd'

const textPositions = [
  { value: 'topleft', text: 'Top Left' },
  { value: 'topright', text: 'Top Right' },
  { value: 'bottomleft', text: 'Bottom Left' },
  { value: 'bottomright', text: 'Bottom Right' }
]

const titleSizes = [
  { value: 'medium', text: 'Medium' },
  { value: 'small', text: 'Small' },
  { value: 'large', text: 'Large' },
  { value: 'standard', text: 'Standard' }
]

const kinds = [
  { value: 'editorial', text: 'Editorial' },
  { value: 'meta', text: 'Meta' },
  { value: 'social', text: 'Social' }
]

const styles = {
  line: css({
    position: 'absolute',
    margin: 0,
    padding: 0,
    top: 0,
    left: 0,
    right: 0,
    borderTop: `1px dashed ${colors.primary}`
  }),
  dragButton: css(
    buttonStyles.mark,
    {
      position: 'absolute',
      top: 0,
      left: 0
    }
  )
}

export const TeaserButton = options => createActionButton({
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

const Form = ({ node, onChange }) => {
  return <SidebarForm>
    <Dropdown
      label='Text-Position'
      items={textPositions}
      value={node.data.get('textPosition')}
      onChange={({value}) => onChange('textPosition', null, value)}
      />
    <Dropdown
      label='Inhaltsbezeichnung'
      items={kinds}
      value={node.data.get('kind')}
      onChange={({value}) => {
        onChange('kind', null, value)
      }}
      />
    <Dropdown
      label='Titelgrösse'
      items={titleSizes}
      value={node.data.get('titleSize')}
      onChange={({value}) => {
        onChange('titleSize', null, value)
      }}
      />
    <Checkbox
      checked={node.data.get('center')}
      onChange={onChange('center')}
      >
        Text zentriert
      </Checkbox>
    <Checkbox
      checked={node.data.get('reverse')}
      onChange={onChange('reverse')}
      >
        Titel und Bild wechseln
      </Checkbox>
    <Checkbox
      checked={node.data.get('portrait')}
      onChange={onChange('portrait')}
      >
        Hochformat
      </Checkbox>
    <ColorPicker
      label='Textfarbe'
      value={node.data.get('color')}
      onChange={color => {
        onChange('color', null, color)
      }}
      />
    <ColorPicker
      label='Hintergrundfarbe'
      value={node.data.get('bgColor')}
      onChange={color => {
        onChange('bgColor', null, color)
      }}
      />
    <ColorPicker
      label='Linkfarbe'
      value={node.data.get('linkColor')}
      onChange={color => {
        onChange('linkColor', null, color)
      }}
      />
    <ImageInput
      label='Bild'
      src={node.data.get('image')}
      onChange={onChange('image')}
          />
  </SidebarForm>
}

export const TeaserForm = options => {
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

      const handlerFactory = createOnFieldChange(change => {
        const newTeaser = change.value.document.getDescendant(teaser.key)
        return onChange(
          newTeaser.nodes
            .reduce(
              (t, child) => {
                return t.setNodeByKey(
                  child.key,
                  { data: newTeaser.data }
                )
              },
              change
            )
        )
      }, value, teaser)

      return <div>
        <Label>Teaser</Label>
        <Form node={teaser} onChange={handlerFactory} />
      </div>
    }
  )
}

export const TeaserInlineUI = options => createDropTarget(createMoveDragSource(
  ({ connectDragSource, connectDropTarget, isDragging, isOver, children }) => {
    const dragSource = connectDragSource(
      <span contentEditable={false} {...styles.dragButton}><ArrowsIcon /></span>)
    const dropTarget = connectDropTarget(
      <span> {
        children
      } </span>
    )

    return (
      <span style={{ position: 'relative', display: 'block' }}>
        {dragSource}
        {dropTarget}
      </span>
    )
  }
))
