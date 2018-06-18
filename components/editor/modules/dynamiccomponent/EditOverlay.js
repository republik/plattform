import React, { Fragment } from 'react'
import { fromJS } from 'immutable'

import OverlayFormManager from '../../utils/OverlayFormManager'
import JSONField from '../../utils/JSONField'

import {
  Interaction,
  Label,
  Radio
} from '@project-r/styleguide'

export default (props) => {
  return <OverlayFormManager showEditButton={false} {...props}
    onChange={(data) => {
      props.editor.change(change => {
        change.setNodeByKey(props.node.key, {
          data
        })
      })
    }}>
    {({data, onChange}) => {
      const config = data.toJS()
      const parent = props.editor.value.document.getParent(props.node.key)

      return (
        <Fragment>
          <Interaction.P>
            <Label>Size</Label><br />
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
            ].map((size) => {
              let checked = Object.keys(size.props).every(key => (
                data.get(key) === size.props[key]
              ))
              if (size.unwrap) {
                checked = checked && parent.kind === 'document'
              }
              if (size.wrap) {
                checked = checked && parent.type === size.wrap
              }

              return (
                <Radio key={size.label} checked={checked} onChange={(event) => {
                  event.preventDefault()
                  if (checked) {
                    return
                  }

                  props.editor.change(change => {
                    change.setNodeByKey(props.node.key, {
                      data: data.merge(size.props)
                    })
                    if (size.unwrap) {
                      for (let i = change.value.document.getDepth(props.node.key); i > 1; i--) {
                        change = change.unwrapNodeByKey(props.node.key)
                      }
                    } else if (size.wrap && parent.type !== size.wrap) {
                      change = change.wrapBlockByKey(
                        props.node.key,
                        {type: size.wrap}
                      )
                    }
                  })
                }} style={{marginRight: 15}}>
                  {size.label}
                </Radio>
              )
            })}
          </Interaction.P>
          <Interaction.P>
            <JSONField
              label='Config'
              value={config}
              onChange={(value) => {
                onChange(fromJS(value))
              }} />
          </Interaction.P>
        </Fragment>
      )
    }}
  </OverlayFormManager>
}
