import { Checkbox, Label, Radio } from "@project-r/styleguide";

import {
  MetaSection,
  MetaSectionTitle,
  MetaOption, MetaOptionGroupTitle, MetaOptionGroup
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

      <MetaOptionGroupTitle>{t('metaData/tts/voice/dropdown')}</MetaOptionGroupTitle>
      <MetaOptionGroup>
        {VOICES.map((option, i) => (
          <Radio
            key={i}
            checked={voice === option.value}
            onChange={() => {
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
        <div style={{ marginTop: 5 }}>
          <Label>{t('metaData/tts/voice/warning')}</Label>
        </div>
      </MetaOptionGroup>
    </MetaSection>
  )
})
