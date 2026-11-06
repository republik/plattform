'use client'

import { ValidateGiftTokenDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import {
  getGiftAccess,
  isGiftAccessValid,
  storeGiftAccess,
  storeGiftAttribution,
  type GiftAccess,
} from './gift-access'

export type GiftAccessState = {
  /** Redeemed link for the current article, live or run out. */
  giftAccess: GiftAccess | null
  /** The article is unlocked: a redeemed link that hasn't run out. */
  hasGiftAccess: boolean
  /** A link for this article was redeemed, but it has run out. */
  giftExpired: boolean
}

const NO_GIFT: GiftAccessState = {
  giftAccess: null,
  hasGiftAccess: false,
  giftExpired: false,
}

/**
 * Redeems a `?gift=` token and reports whether the article on screen is
 * unlocked by one.
 *
 * The token comes from the URL the recipient followed, the document id from
 * the article itself (see `ContentWall`). Access is granted only for the
 * article the token names, so editing the URL can't move it to another piece.
 */
export function useGiftAccess(
  token: string | null,
  documentId: string | null,
): GiftAccessState {
  const { data } = useQuery(ValidateGiftTokenDocument, {
    variables: { token: token as string },
    skip: !token,
  })

  // localStorage isn't reactive, so redemptions bump this to re-read it.
  const [redemptions, setRedemptions] = useState(0)

  useEffect(() => {
    const result = data?.validateGiftToken
    if (!token || !result) {
      return
    }

    // Stored even when it has run out, so a later visit still says so.
    storeGiftAccess({
      token,
      documentId: result.documentId,
      expiresAt: result.expiresAt,
      granter: result.granter
        ? {
            name: result.granter.name,
            portrait: result.granter.portrait ?? null,
            hasPublicProfile: result.granter.hasPublicProfile,
          }
        : null,
    })
    storeGiftAttribution(token, result.documentId)
    setRedemptions((n) => n + 1)
  }, [data, token])

  return useMemo(() => {
    const giftAccess = getGiftAccess(documentId)
    if (!giftAccess) {
      return NO_GIFT
    }
    const valid = isGiftAccessValid(giftAccess)
    return {
      giftAccess,
      hasGiftAccess: valid,
      giftExpired: !valid,
    }
    // `redemptions` stands in for the localStorage write above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, redemptions])
}
