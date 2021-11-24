import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SlatePropTypes from 'slate-prop-types'
import { css } from 'glamor'
import { IconButton, useColorContext } from '@project-r/styleguide'

import MdEdit from 'react-icons/lib/md/edit'

import OverlayForm from './OverlayForm'
import InlineUI, { MarkButton } from './InlineUI'
import ArrowDownIcon from 'react-icons/lib/md/arrow-downward'

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
      nested,
      children
    } = this.props
    const startEditing = () => {
      this.setState({ showModal: true })
    }
    const showModal = this.state.showModal || node.data.get('isNew')
    const parent = editor.value.document.getParent(node.key)

    console.log(node.type, parent.type)

    return (
      <div {...attributes} style={{ position: 'relative' }}>
        <InlineUI
          node={nested ? parent : node}
          editor={editor}
          style={{ left: -100 }}
        >
          <MarkButton onMouseDown={startEditing}>
            <MdEdit size={20} />
          </MarkButton>
        </InlineUI>
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
        <div onDoubleClick={startEditing}>{component || preview}</div>
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
