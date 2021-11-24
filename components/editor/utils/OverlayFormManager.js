import React, { Component, useContext, useState } from 'react'
import PropTypes from 'prop-types'
import SlatePropTypes from 'slate-prop-types'
import { css } from 'glamor'
import { IconButton, useColorContext } from '@project-r/styleguide'

import MdEdit from 'react-icons/lib/md/edit'

import OverlayForm from './OverlayForm'
import InlineUI, { MarkButton } from './InlineUI'
import ArrowDownIcon from 'react-icons/lib/md/arrow-downward'
import { matchAncestor } from './matchers'
import { OverlayFormContext } from './OverlayFormContext'

const styles = {
  editButton: css({
    position: 'absolute',
    zIndex: 1,
    fontSize: 24,
    ':hover': {
      cursor: 'pointer'
    }
  })
}

const EditButton = ({ onClick, size, parentType }) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      //{...styles.editButton}
      role='button'
      onClick={onClick}
      /*style={{
        top: size === 'breakout' || !parentType ? -40 : 0,
        left: !parentType ? 0 : -40
      }}*/
    >
      <MdEdit {...colorScheme.set('fill', 'text')} />
    </div>
  )
}

const OverlayFormManager = ({
  editor,
  node,
  attributes,
  onChange,
  component,
  preview,
  autoDarkModePreview,
  extra,
  showPreview,
  title,
  nested,
  children
}) => {
  const { showModal, setShowModal } = useContext(OverlayFormContext)
  const startEditing = () => setShowModal(true)
  const isOpen = showModal || node.data.get('isNew')
  const parent = editor.value.document.getParent(node.key)

  return (
    <div {...attributes} style={{ position: 'relative' }}>
      {isOpen && (
        <OverlayForm
          preview={preview}
          autoDarkModePreview={autoDarkModePreview}
          showPreview={showPreview}
          title={title}
          extra={extra}
          onClose={() => {
            setShowModal(false)
            node.data.get('isNew') &&
              editor.change(change => {
                change.setNodeByKey(node.key, {
                  data: node.data.delete('isNew')
                })
              })
          }}
        >
          {children({ data: node.data, onChange })}
        </OverlayForm>
      )}
      <div onDoubleClick={startEditing}>{component || preview}</div>
    </div>
  )
}

OverlayFormManager.propTypes = {
  onChange: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  component: PropTypes.node,
  preview: PropTypes.node,
  extra: PropTypes.node,
  attributes: PropTypes.object,
  editor: PropTypes.shape({
    change: PropTypes.func.isRequired
  }).isRequired,
  node: SlatePropTypes.node.isRequired
}

export default OverlayFormManager
