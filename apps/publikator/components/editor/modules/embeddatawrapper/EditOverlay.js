import { IconEdit } from '@republik/icons'
import OverlayFormManager from '../../utils/OverlayFormManager'

import {
  A,
  Checkbox,
  Field,
  Interaction,
  Label,
  Radio,
} from '@project-r/styleguide'

const Form = ({ data, onChange, editor, node, resizable }) => {
  const parent = editor.value.document.getParent(node.key)
  const datawrapperId = node.data.get('datawrapperId')
  const plain = node.data.get('plain')
  const forceDark = node.data.get('forceDark')

  return (
    <>
      {!!resizable && (
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
      )}
      <Interaction.P>
        <Field
          label='Datawrapper Chart-ID'
          value={datawrapperId}
          onChange={(e, value) => onChange(data.set('datawrapperId', value))}
          required
        />
      </Interaction.P>
      <Interaction.P>
        <Label>
          <Checkbox
            name='plain'
            checked={plain}
            onChange={(e, value) => onChange(data.set('plain', value))}
          />{' '}
          Header und Footer ausblenden
        </Label>
      </Interaction.P>
      <Interaction.P>
        <Label>
          <Checkbox
            name='forceDark'
            checked={forceDark}
            onChange={(e, value) => onChange(data.set('forceDark', value))}
          />{' '}
          Dunkles Farbschema forcieren
        </Label>
      </Interaction.P>
    </>
  )
}

const DatawrapperEdit = ({ datawrapperId }) => {
  return datawrapperId ? (
    <Interaction.P style={{ fontSize: 14 }}>
      <A
        href={`/datawrapper/chart/${datawrapperId}/edit`}
        target='_blank'
        rel='noreferrer'
      >
        <IconEdit size={18} /> Grafik in Datawrapper bearbeiten
      </A>{' '}
      (nur Produktion)
    </Interaction.P>
  ) : null
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
      title='Datawrapper (Beta)'
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
          <DatawrapperEdit datawrapperId={data.get('datawrapperId')} />
        </>
      )}
    </OverlayFormManager>
  )
}
export default EditOverlay
