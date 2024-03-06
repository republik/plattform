'use client'

import { useMutation } from '@apollo/client'
import { CTABasicBanner } from './basic-banner'
import { useState } from 'react'
import {
  AcknowledgeCtaDocument,
  MyCallToActionsQuery,
} from '@graphql/republik-api/__generated__/gql/graphql'

type CTARendererProps = {
  cta: MyCallToActionsQuery['me']['callToActions'][0]
}

export function CTARenderer({ cta }: CTARendererProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [acknowledge] = useMutation(AcknowledgeCtaDocument)

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
