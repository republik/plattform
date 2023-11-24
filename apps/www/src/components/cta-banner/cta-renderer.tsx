'use client'

import { useMutation } from '@apollo/client'
import { CTABasicBanner } from './basic-banner'
import { CallToActionsQueryResult } from '@app/graphql/republik-api/cta-banner.query'
import {
  ACKNOWLEDGE_CTA_MUTATION,
  AcknowledgeCTAMutationResult,
  AcknowledgeCTAMutationVariables,
} from '@app/graphql/republik-api/cta-banner.mutation'
import { useState } from 'react'

type CTARendererProps = {
  cta: CallToActionsQueryResult['me']['callToActions'][0]
}

export function CTARenderer({ cta }: CTARendererProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [acknowledge] = useMutation<
    AcknowledgeCTAMutationResult,
    AcknowledgeCTAMutationVariables
  >(ACKNOWLEDGE_CTA_MUTATION)

  async function acknowledgeCTA() {
    setAcknowledged(true)
    await acknowledge({
      variables: {
        id: cta.id,
        response: undefined,
      },
    })
  }

  if (acknowledged) {
    return null
  }

  if (cta.payload.__typename === 'CallToActionBasicPayload') {
    return (
      <CTABasicBanner
        id={cta.id}
        payload={cta.payload}
        handleAcknowledge={() => acknowledgeCTA()}
      />
    )
  }

  console.log("Can't render CTA of type ", cta.payload.__typename)

  return null
}
