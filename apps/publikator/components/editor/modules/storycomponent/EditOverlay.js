import { Fragment, useState } from 'react'
import { fromJS } from 'immutable'

import { Interaction, Label, Radio, Autocomplete } from '@project-r/styleguide'
import { STORY_NAMES } from '@republik/story-loader'

import { JSONEditor } from '../../utils/CodeEditorFields'
import OverlayFormManager from '../../utils/OverlayFormManager'

const storyNamesAutocomplete = STORY_NAMES.map((name) => ({
  value: name,
  text: name,
}))

const Form = ({ data, onChange, editor, node }) => {
  const { name, ...config } = data.toJS()
  const parent = editor.value.document.getParent(node.key)
  const [nameFilter, setNameFilter] = useState()
  const [nameValue, setNameValue] = useState({ value: name, text: name })

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
        <Autocomplete
          label='Name'
          value={nameValue}
          filter={nameFilter}
          items={storyNamesAutocomplete.filter(
            ({ text }) =>
              !nameFilter ||
              text.toLowerCase().includes(nameFilter.toLowerCase()),
          )}
          onChange={(value) => {
            setNameValue(value)
            let newData = data.set('name', value.value)
            onChange(newData)
          }}
          onFilterChange={(filter) => setNameFilter(filter)}
        />
      </Interaction.P>
      <Interaction.P>
        <JSONEditor
          label='Config'
          config={config}
          onChange={(value) => {
            onChange(fromJS(value).set('name', nameValue.value))
          }}
        />
      </Interaction.P>
    </Fragment>
  )
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
