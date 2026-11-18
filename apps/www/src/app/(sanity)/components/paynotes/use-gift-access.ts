'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  getGiftAccess,
  isGiftAccessValid,
  storeGiftAccess,
  storeGiftAttribution,
  type GiftAccess,
} from './gift-access'
import { verifyGiftToken } from './verify-gift-token'

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
 * the article itself (see `ContentWall`). The token's signature is checked on
 * the server (`verifyGiftToken`), and access is granted only for the article
 * the signed token names, so editing the URL can't move it to another piece
 * or push its expiry out.
 */
export function useGiftAccess(
  token: string | null,
  documentId: string | null,
): GiftAccessState {
  // localStorage isn't reactive, so redemptions bump this to re-read it.
  const [redemptions, setRedemptions] = useState(0)

  useEffect(() => {
    if (!token) {
      return
    }
    let cancelled = false
    verifyGiftToken(token)
      .then((result) => {
        if (cancelled || !result) {
          return
        }
        // Stored even when it has run out, so a later visit still says so.
        storeGiftAccess({
          token,
          documentId: result.documentId,
          expiresAt: result.expiresAt,
        })
        storeGiftAttribution(token, result.documentId)
        setRedemptions((n) => n + 1)
      })
      .catch(() => {
        // Treated like an invalid link: the article stays behind its wall.
      })
    return () => {
      cancelled = true
    }
  }, [token])

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
