import { Set, Map } from 'immutable'

import { Field, Dropdown } from '@project-r/styleguide'

import {
  MetaSection,
  MetaSectionTitle,
  MetaOption,
  MetaOptionGroup,
  MetaOptionGroupTitle,
} from '../../../MetaDataForm/components/Layout'
import MetaForm from '../../utils/MetaForm'
import ImageCrop from '../../utils/ImageCrop'
import withT from '../../../../lib/withT'

export default withT(({ t, editor, node, onInputChange, format }) => {
  const audioCoverAnchors = [null, 'middle'].map((value) => ({
    value,
    text: t(`metaData/audio/cover/anchor/${value}`),
  }))

  const onChange = (key) => (newValue) => {
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data:
          newValue !== null
            ? node.data.set(key, newValue)
            : node.data.remove(key),
      })
    })
  }

  const audioCover = node.data.get('audioCover')

  const audioSourceKeys = Set(['audioSourceMp3', 'audioSourceAac'])
  const audioDefaultValues = Map(audioSourceKeys.map((key) => [key, '']))
  const audioSourceData = audioDefaultValues.merge(
    node.data.filter((_, key) => audioSourceKeys.has(key)),
  )

  return (
    <MetaSection>
      <MetaSectionTitle>{t('metaData/audio')}</MetaSectionTitle>
      <MetaOption>
        <MetaForm
          data={audioSourceData}
          onInputChange={onInputChange}
          getWidth={() => ''}
          black
        />
      </MetaOption>
      <MetaOptionGroupTitle>Play-Button auf Artikel-Bild</MetaOptionGroupTitle>
      <MetaOptionGroup>
        <MetaOption>
          <Dropdown
            black
            label='Position'
            items={audioCoverAnchors}
            value={audioCover ? audioCover.anchor : ''}
            onChange={({ value }) =>
              onChange('audioCover')(
                value && {
                  anchor: value,
                  color: (audioCover && audioCover.color) || '#fff',
                  backgroundColor:
                    (audioCover && audioCover.backgroundColor) ||
                    'rgba(255,255,255,0.3)',
                },
              )
            }
          />
        </MetaOption>
        {audioCover && (
          <Field
            black
            label={t('metaData/audio/cover/color')}
            value={audioCover.color}
            onChange={(_, color) => {
              onChange('audioCover')({
                ...audioCover,
                color,
              })
            }}
          />
        )}
        {audioCover && (
          <MetaOption>
            <Field
              black
              label={t('metaData/audio/cover/backgroundColor')}
              value={audioCover.backgroundColor}
              onChange={(_, backgroundColor) => {
                onChange('audioCover')({
                  ...audioCover,
                  backgroundColor,
                })
              }}
            />
          </MetaOption>
        )}
      </MetaOptionGroup>
      <MetaOptionGroupTitle>Audio-Cover und Vorschau</MetaOptionGroupTitle>
      <MetaOption>
        <ImageCrop
          image={node.data.get('image')}
          crop={node.data.get('audioCoverCrop')}
          onChange={(crop) => onChange('audioCoverCrop')(crop)}
          format={format}
        />
      </MetaOption>
    </MetaSection>
  )
})
