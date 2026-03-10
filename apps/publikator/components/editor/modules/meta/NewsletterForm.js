import { Checkbox, Field } from '@project-r/styleguide'
import {
  MetaOptionGroup,
  MetaOptionGroupTitle,
  MetaSection,
  MetaSectionTitle,
} from '../../../MetaDataForm/components/Layout'

export default function NewsletterForm({ editor, node }) {
  const template = node.data.get('template')

  if (template !== 'format') {
    return null
  }

  const newsletter = node.data.get('newsletter')

  const handleChange = (field) => (_, value) => {
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data: node.data.set('newsletter', {
          ...newsletter,
          [field]:
            field === 'savedSegmentId' && value ? parseInt(value, 10) : value,
        }),
      })
    })
  }

  return (
    <MetaSection>
      <MetaSectionTitle>Newsletter</MetaSectionTitle>

      <Field
        label={'Absender-Name'}
        value={newsletter?.fromName}
        onChange={handleChange('fromName')}
      />
      <Field
        label={'Absender-Adresse'}
        value={newsletter?.replyTo}
        onChange={handleChange('replyTo')}
      />
      <Checkbox
        black
        checked={newsletter?.free}
        onChange={handleChange('free')}
      >
        Nicht-Mitglieder können diesen Newsletter abonnieren
      </Checkbox>

      <MetaOptionGroupTitle>Danger Zone</MetaOptionGroupTitle>
      <MetaOptionGroup>
        <div
          style={{
            display: 'grid',
            gap: 15,
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <Field
            label={'Newsletter-ID'}
            value={newsletter?.name}
            onChange={handleChange('name')}
          />

          <Field
            label={'MailChimp-Segment-ID'}
            value={newsletter?.savedSegmentId}
            onChange={handleChange('savedSegmentId')}
          />
        </div>
      </MetaOptionGroup>
    </MetaSection>
  )
}
