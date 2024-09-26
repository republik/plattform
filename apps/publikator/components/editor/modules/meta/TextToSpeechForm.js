import { Checkbox, Radio } from "@project-r/styleguide";

import {
  MetaSection,
  MetaSectionTitle,
  MetaOption, MetaOptionGroupTitle
} from "../../../MetaDataForm/components/Layout";
import withT from '../../../../lib/withT'
import { useState } from "react";

const VOICES = [
  { value: 'huebsch-62964', text: 'Frau 1' },
  { value: 'huebsch-08316', text: 'Frau 2' },
  { value: 'huebsch-01150', text: 'Mann 1' },
  { value: 'huebsch-01670', text: 'Mann 2' },
]

export default withT(({ t, editor, node, onInputChange }) => {
  const voice = node.data.get('syntheticVoice')
  const suppressed = node.data.get('suppressSyntheticReadAloud')
  const [error, setError] = useState(undefined)

  const checkVoice = () => {
    if (voice) {
      setError(t('metaData/tts/voice/warning'))
    }
  }

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
        <MetaOptionGroupTitle>{t('metaData/tts/voice/dropdown')}</MetaOptionGroupTitle>
        {VOICES.map((option, i) => (
          <Radio
            key={i}
            checked={voice === option.value}
            onChange={() => {
              checkVoice(option.value)
              editor.change((change) => {
                change.setNodeByKey(node.key, {
                  data: node.data.set('syntheticVoice', option.value),
                })
              })
            }}
            style={{ marginRight: 30 }}
          >
            {option.text}
          </Radio>
        ))}
        { error && <p><small>
          {error}
        </small></p>}
      </MetaOption>
    </MetaSection>
  )
})
