import React from 'react'

import { FlyerTile, Flyer, ColorContextProvider } from '@project-r/styleguide'

import { useMe } from '../../lib/context/MeContext'
import { getElementFromSeed } from '../../lib/utils/helpers'
import { useTranslation } from '../../lib/withT'

import { useResolvedColorSchemeKey } from '../ColorScheme/lib'
import TrialForm from '../Trial/Form'

const TRY = ['221206-v1', '221206-v2']
const BUY = ['221206-v1', '221206-v2']

const NOTES: { [K in PaynoteType]: string[] } = {
  trial: TRY,
  buy: BUY,
}

type PaynoteType = 'trial' | 'buy'

const Paynote: React.FC<{ seed: number }> = ({ seed }) => {
  const colorSchemeKey = useResolvedColorSchemeKey()
  const { hasActiveMembership } = useMe()
  const { t } = useTranslation()

  const noteType: PaynoteType = hasActiveMembership ? 'buy' : 'trial'

  console.log({ seed })

  const noteKey = getElementFromSeed(NOTES[noteType], seed)

  return (
    <ColorContextProvider
      colorSchemeKey={colorSchemeKey === 'light' ? 'dark' : 'light'}
    >
      <FlyerTile>
        <Flyer.H3>{t(`flyer/paynote/${noteType}/${noteKey}/title`)}</Flyer.H3>
        <Flyer.P>{t(`flyer/paynote/${noteType}/${noteKey}/body`)}</Flyer.P>
        <TrialForm minimal black />
      </FlyerTile>
    </ColorContextProvider>
  )
}

export default Paynote
