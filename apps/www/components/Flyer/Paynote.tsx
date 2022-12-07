import React from 'react'

import {
  FlyerTileMeta,
  Flyer,
  ColorContextProvider,
} from '@project-r/styleguide'

import { useMe } from '../../lib/context/MeContext'
import { getElementFromSeed } from '../../lib/utils/helpers'
import { useTranslation } from '../../lib/withT'

import { useResolvedColorSchemeKey } from '../ColorScheme/lib'
import TrialForm from '../Trial/Form'
import { BuyNoteCta, generatePositionedNote } from '../Article/PayNote'

const TRY = ['221206-v1', '221206-v2']
const BUY = ['221206-v1', '221206-v2']

const NOTES: { [K in PaynoteType]: string[] } = {
  trial: TRY,
  buy: BUY,
}

type PaynoteType = 'trial' | 'buy'

type TrackingProps = {
  repoId: string
  documentId: string
  variation: string
}

const BuyForm: React.FC<TrackingProps> = ({
  variation,
  documentId,
  repoId,
}) => {
  const payNote = generatePositionedNote(variation, 'button', 'before').before
  const trackingPayload: TrackingProps = {
    documentId,
    repoId,
    variation,
  }
  return <BuyNoteCta payNote={payNote} payload={trackingPayload} />
}

const Paynote: React.FC<{
  seed: number
  repoId: string
  documentId: string
}> = ({ seed, repoId, documentId }) => {
  const colorSchemeKey = useResolvedColorSchemeKey()
  const { hasAccess } = useMe()
  const { t } = useTranslation()

  // TODO: disable buyNote for iOS

  const noteType: PaynoteType = hasAccess ? 'buy' : 'trial'
  const noteKey = getElementFromSeed(NOTES[noteType], seed)

  const trackingPayload: TrackingProps = {
    documentId,
    repoId,
    variation: `${noteType}/${noteKey}`,
  }

  return (
    <ColorContextProvider
      colorSchemeKey={colorSchemeKey === 'light' ? 'dark' : 'light'}
    >
      <FlyerTileMeta>
        <Flyer.H3>{t(`flyer/paynote/${noteType}/${noteKey}/title`)}</Flyer.H3>
        <Flyer.P>{t(`flyer/paynote/${noteType}/${noteKey}/body`)}</Flyer.P>
        {noteType === 'trial' ? (
          <TrialForm payload={trackingPayload} minimal />
        ) : (
          <BuyForm {...trackingPayload} />
        )}
      </FlyerTileMeta>
    </ColorContextProvider>
  )
}

export default Paynote
