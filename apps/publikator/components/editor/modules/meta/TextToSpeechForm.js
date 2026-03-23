import {
  Checkbox,
  Dropdown,
  Label,
  useColorContext,
} from '@project-r/styleguide'
import React from 'react'
import withT from '../../../../lib/withT'

import {
  MetaOption,
  MetaSection,
  MetaSectionTitle,
} from '../../../MetaDataForm/components/Layout'

const VoiceOption = ({ text, description }) => {
  const [colorScheme] = useColorContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
      <span>{text}</span>
      <small style={{ color: colorScheme.getCSSColor('textSoft') }}>
        {description}
      </small>
    </div>
  )
}

const VOICES = [
  {
    value: 'huebsch-01150-rpblk',
    text: 'Mann 1',
    element: <VoiceOption text='Mann 1' description='erzählend (*)' />,
  },
  {
    value: 'huebsch-62964-rpblk',
    text: 'Frau 1',
    element: <VoiceOption text='Frau 1' description='ernst (*)' />,
  },
  {
    value: 'huebsch-714-109-rpblk',
    text: 'Mann 2',
    element: <VoiceOption text='Mann 2' description='ernst' />,
  },
  {
    value: 'huebsch-82170-rpblk',
    text: 'Frau 2',
    element: <VoiceOption text='Frau 2' description='allrounder' />,
  },
  {
    value: 'huebsch-285-169-rpblk',
    text: 'Mann 3',
    element: <VoiceOption text='Mann 3' description='locker' />,
  },
  {
    value: 'huebsch-gen-female-e-rpblk',
    text: 'Frau 3',
    element: <VoiceOption text='Frau 3' description='locker' />,
  },
]

const isDeprecatedVoice = (voice) => {
  return !VOICES.find((v) => v.value === voice)
}

const DeprecatedVoiceWarning = withT(({ voice, t }) => {
  if (!voice || !isDeprecatedVoice(voice)) {
    return null
  }
  return <Label>{t('metaData/tts/deprecated', { voice })}</Label>
})

export default withT(({ t, editor, node, onInputChange }) => {
  const voice = node.data.get('syntheticVoice')
  const voice2 = node.data.get('syntheticVoice2')
  const suppressed = node.data.get('suppressSyntheticReadAloud')
  return (
    <MetaSection>
      <MetaSectionTitle>{t('metaData/tts')}</MetaSectionTitle>
      <MetaOption>
        <Checkbox
          checked={suppressed}
          onChange={onInputChange('suppressSyntheticReadAloud')}
          black
        >
          {t('metaData/tts/suppress')}
        </Checkbox>
      </MetaOption>

      <div style={{ marginBottom: 40 }}>
        <div>
          <Dropdown
            label={t('metaData/tts/voice/dropdown')}
            value={voice}
            items={VOICES}
            onChange={(item) => {
              editor.change((change) => {
                change.setNodeByKey(node.key, {
                  data: node.data.set('syntheticVoice', item.value),
                })
              })
            }}
          ></Dropdown>
        </div>
        <DeprecatedVoiceWarning voice={voice} />
      </div>

      <div style={{ marginBottom: 60 }}>
        <div>
          <Dropdown
            label={t('metaData/tts/voice2/dropdown')}
            value={voice2}
            items={VOICES}
            onChange={(item) => {
              editor.change((change) => {
                change.setNodeByKey(node.key, {
                  data: node.data.set('syntheticVoice2', item.value),
                })
              })
            }}
          ></Dropdown>
        </div>
        <DeprecatedVoiceWarning voice={voice2} />
      </div>
      <Label>{t('metaData/tts/voice/warning')}</Label>
    </MetaSection>
  )
})
