import React from 'react'

import {
  FlyerTileMeta,
  Flyer,
  InvertedColorScheme,
} from '@project-r/styleguide'

import { useMe } from '../../lib/context/MeContext'
import { getElementFromSeed } from '../../lib/utils/helpers'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { useTranslation } from '../../lib/withT'

import TrialForm from '../Trial/Form'
import { BuyNoteCta, generatePositionedNote } from '../Article/PayNote'

const TRY = ['221206-v1', '221206-v2']
const BUY = ['221206-v1', '221206-v2']
const IOS = ['221212-v1']

const NOTES: { [K in PaynoteType]: string[] } = {
  trial: TRY,
  buy: BUY,
  ios: IOS,
}

type PaynoteType = 'trial' | 'buy' | 'ios'

export type TrackingProps = {
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
  const { hasAccess } = useMe()
  const { inNativeIOSApp } = useInNativeApp()
  const { t } = useTranslation()

  const noteType: PaynoteType = hasAccess
    ? inNativeIOSApp
      ? 'ios'
      : 'buy'
    : 'trial'
  const noteKey = getElementFromSeed(NOTES[noteType], seed)

  const trackingPayload: TrackingProps = {
    documentId,
    repoId,
    variation: `${noteType}/${noteKey}`,
  }

  let cta = null
  if (noteType === 'trial') {
    cta = <TrialForm payload={trackingPayload} minimal />
  } else if (noteType === 'buy') {
    cta = <BuyForm {...trackingPayload} />
  }

  return (
    <InvertedColorScheme>
      <FlyerTileMeta>
        <Flyer.H3>{t(`flyer/paynote/${noteType}/${noteKey}/title`)}</Flyer.H3>
        <Flyer.P>{t(`flyer/paynote/${noteType}/${noteKey}/body`)}</Flyer.P>
        {cta}
      </FlyerTileMeta>
    </InvertedColorScheme>
  )
}

export default Paynote
