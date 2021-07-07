import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SlatePropTypes from 'slate-prop-types'
import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'

import MdEdit from 'react-icons/lib/md/edit'

import OverlayForm from './OverlayForm'

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
      {...styles.editButton}
      role='button'
      onClick={onClick}
      style={{
        top: size === 'breakout' || !parentType ? -40 : 0,
        left: !parentType ? 0 : -40
      }}
    >
      <MdEdit {...colorScheme.set('fill', 'text')} />
    </div>
  )
}

class OverlayFormManager extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      showModal: false
    }
  }
  render() {
    const {
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
      children
    } = this.props
    const startEditing = () => {
      this.setState({ showModal: true })
    }
    const showModal = this.state.showModal || node.data.get('isNew')
    const parent = editor.value.document.getParent(node.key)

    return (
      <div
        {...attributes}
        style={{ position: 'relative' }}
        onDoubleClick={startEditing}
      >
        <EditButton
          size={node.data.get('size')}
          parentType={parent.type}
          onClick={startEditing}
        />
        {showModal && (
          <OverlayForm
            preview={preview}
            autoDarkModePreview={autoDarkModePreview}
            showPreview={showPreview}
            title={title}
            extra={extra}
            onClose={() => {
              this.setState({ showModal: false })
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
        {component || preview}
      </div>
    )
  }
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
