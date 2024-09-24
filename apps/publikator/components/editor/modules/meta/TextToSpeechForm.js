import { Dropdown, Checkbox } from '@project-r/styleguide'

import {
  MetaSection,
  MetaSectionTitle,
  MetaOption,
} from '../../../MetaDataForm/components/Layout'
import withT from '../../../../lib/withT'

const VOICES = [
  { value: 'huebsch-62964', text: 'Politik' },
  { value: 'huebsch-08316', text: 'Wirtschaft' },
  { value: 'huebsch-01150', text: 'Gesellschaft' },
  { value: 'huebsch-01670', text: 'Kultur' },
]

export default withT(({ t, editor, node, onInputChange }) => {
  const voice = node.data.get('syntheticVoice')
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
      <MetaOption>
        <Dropdown
          black
          label={t('metaData/tts/voice/dropdown')}
          disabled={suppressed}
          items={VOICES}
          value={voice || ''}
          onChange={({ value }) => {
            editor.change((change) => {
              change.setNodeByKey(node.key, {
                data: node.data.set('syntheticVoice', value),
              })
            })
          }}
        />
      </MetaOption>
    </MetaSection>
  )
})
