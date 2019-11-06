import React, { Component, Fragment } from 'react'
import { fromJS } from 'immutable'
import debounce from 'lodash.debounce'

import OverlayFormManager from '../../utils/OverlayFormManager'
import JSONField, { renderAutoSize } from '../../utils/JSONField'

import { Interaction, Label, Radio, Field } from '@project-r/styleguide'

import { getHtml } from './utils'

class Form extends Component {
  constructor(...args) {
    super(...args)
    this.state = {}

    this.clearAutoHtmlObserver = () => {
      if (this.autoHtmlObserver) {
        this.autoHtmlObserver.disconnect()
        this.autoHtmlObserver = undefined
      }
    }
    this.setAutoHtmlRef = ref => {
      this.clearAutoHtmlObserver()
      this.autoHtmlRef = ref
      if (ref) {
        const afterMutations = debounce(() => {
          this.clearAutoHtmlObserver()
          const html = getHtml(ref)
          if (html !== this.props.data.get('html')) {
            this.props.onChange(this.props.data.set('html', html))
          }
          this.setState({ autoHtml: false })
        }, 500)

        this.autoHtmlObserver = new window.MutationObserver(afterMutations)
        this.autoHtmlObserver.observe(ref, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        })
        afterMutations()
      }
    }
  }
  render() {
    const { data, onChange, editor, node, preview } = this.props
    const { html, ...config } = data.toJS()
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
                types: ['CENTER']
              },
              unwrap: true
            },
            {
              label: 'Gross',
              props: { size: 'breakout' },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER']
              },
              wrap: 'CENTER'
            },
            {
              label: 'Normal',
              props: { size: undefined },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER']
              },
              wrap: 'CENTER'
            },
            {
              label: 'Klein',
              props: { size: 'narrow' },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER']
              },
              wrap: 'CENTER'
            },
            {
              label: 'Links',
              props: { size: 'floatTiny' },
              parent: {
                kinds: ['document', 'block'],
                types: ['CENTER']
              },
              wrap: 'CENTER'
            }
          ].map(size => {
            let checked = Object.keys(size.props).every(
              key => data.get(key) === size.props[key]
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
                onChange={event => {
                  event.preventDefault()
                  if (checked) {
                    return
                  }

                  editor.change(change => {
                    change.setNodeByKey(node.key, {
                      data: data.merge(size.props)
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
                        type: size.wrap
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
          <JSONField
            label='Config'
            value={config}
            onChange={value => {
              onChange(fromJS(value).set('html', html))
              if (value.autoHtml) {
                this.setState({ autoHtml: true })
              }
            }}
          />
        </Interaction.P>
        <Interaction.P>
          <Field
            label='SSR-HTML'
            value={html}
            renderInput={renderAutoSize()}
            onChange={(_, value) => {
              let newData = data.set('html', value)
              if (newData.get('autoHtml')) {
                newData = newData.set('autoHtml', false)
              }
              onChange(newData)
            }}
          />
        </Interaction.P>
        {!!this.state.autoHtml && (
          <div>
            <Label>Rendering HTML…</Label>
            <div ref={this.setAutoHtmlRef}>{preview}</div>
          </div>
        )}
      </Fragment>
    )
  }
}

export default props => {
  const onChange = data => {
    props.editor.change(change => {
      change.setNodeByKey(props.node.key, {
        data
      })
    })
  }
  return (
    <OverlayFormManager showEditButton={false} {...props} onChange={onChange}>
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
