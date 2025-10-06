import { Field, Interaction, Label, Radio } from '@project-r/styleguide'
import OverlayFormManager from '../../utils/OverlayFormManager'

const Form = ({ data, onChange, editor, node }) => {
  const parent = editor.value.document.getParent(node.key)
  const name = node.data.get('name')

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
          label='Story Component Name'
          value={name}
          onChange={(e, value) => onChange(data.set('name', value))}
          required
        />
      </Interaction.P>
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
