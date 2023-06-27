import { Component, Fragment } from 'react'
import { fromJS } from 'immutable'

import OverlayFormManager from '../../utils/OverlayFormManager'
import { JSONEditor } from '../../utils/CodeEditorFields'

import { Interaction, Label, Radio } from '@project-r/styleguide'

class Form extends Component {
  constructor(...args) {
    super(...args)
    this.state = {}
  }

  render() {
    const { data, onChange, editor, node } = this.props
    const config = data.toJS()
    const parent = editor.value.document.getParent(node.key)

    return (
      <Fragment>
        <Interaction.P>
          <Label>Size</Label>
          <br />
          {[
            {
              label: 'Edge to Edge',
              props: { size: undefined },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER'],
              },
              unwrap: true,
            },
            {
              label: 'Gross',
              props: { size: 'breakout' },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER'],
              },
              wrap: 'CENTER',
            },
            {
              label: 'Normal',
              props: { size: undefined },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER'],
              },
              wrap: 'CENTER',
            },
            {
              label: 'Klein',
              props: { size: 'narrow' },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER'],
              },
              wrap: 'CENTER',
            },
            {
              label: 'Links',
              props: { size: 'floatTiny' },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER'],
              },
              wrap: 'CENTER',
            },
          ].map((size) => {
            let checked = Object.keys(size.props).every(
              (key) => data.get(key) === size.props[key],
            )
            if (size.unwrap) {
              checked = checked && parent.kind === 'document'
            }
            if (size.wrap) {
              checked = checked && parent.type === size.wrap
            }

            return (
              <Radio
                key={size.label}
                checked={checked}
                onChange={(event) => {
                  event.preventDefault()
                  if (checked) {
                    return
                  }

                  editor.change((change) => {
                    change.setNodeByKey(node.key, {
                      data: data.merge(size.props),
                    })
                    if (size.unwrap) {
                      for (
                        let i = change.value.document.getDepth(node.key);
                        i > 1;
                        i--
                      ) {
                        change = change.unwrapNodeByKey(node.key)
                      }
                    } else if (size.wrap && parent.type !== size.wrap) {
                      change = change.wrapBlockByKey(node.key, {
                        type: size.wrap,
                      })
                    }
                  })
                }}
                style={{ marginRight: 15 }}
              >
                {size.label}
              </Radio>
            )
          })}
        </Interaction.P>
        <Interaction.P>
          <JSONEditor
            label='Config'
            config={config}
            onChange={(value) => {
              onChange(fromJS(value))
            }}
          />
        </Interaction.P>
      </Fragment>
    )
  }
}

const EditOverlay = (props) => {
  const onChange = (data) => {
    props.editor.change((change) => {
      change.setNodeByKey(props.node.key, {
        data,
      })
    })
  }
  return (
    <OverlayFormManager {...props} onChange={onChange}>
      {({ data, onChange }) => (
        <Form
          data={data}
          onChange={onChange}
          editor={props.editor}
          node={props.node}
          preview={props.preview}
        />
      )}
    </OverlayFormManager>
  )
}
export default EditOverlay
