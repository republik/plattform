import { Field, Interaction, Label, Radio } from '@project-r/styleguide'
import { JSONEditor } from '../../utils/CodeEditorFields'
import OverlayFormManager from '../../utils/OverlayFormManager'

const Form = ({ data, onChange, editor, node }) => {
  const parent = editor.value.document.getParent(node.key)
  const url = node.data.get('url')
  const tagname = node.data.get('tagname')

  return (
    <>
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
        <Field
          label='Story Component URL'
          value={url}
          onChange={(e, value) => onChange(data.set('url', value))}
          required
        />
      </Interaction.P>
      <Interaction.P>
        <Field
          label='HTML Tagname'
          value={tagname}
          onChange={(e, value) => onChange(data.set('tagname', value))}
          required
        />
      </Interaction.P>
      <JSONEditor
        label='Story Component Data'
        config={data.get('componentData')}
        onChange={(componentData) => {
          onChange(data.set('componentData', componentData))
        }}
      />
    </>
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
    <OverlayFormManager
      {...props}
      showPreview={false}
      onChange={onChange}
      title='Story Component (Beta)'
    >
      {({ data, onChange }) => (
        <>
          <Form
            data={data}
            onChange={onChange}
            editor={props.editor}
            node={props.node}
            resizable={props.resizable}
          />
        </>
      )}
    </OverlayFormManager>
  )
}
export default EditOverlay
