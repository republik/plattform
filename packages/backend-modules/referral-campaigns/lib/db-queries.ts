import type { PgDb } from 'pogi'

export function fetchReferralCountByReferrerId(referrerId: string, pgdb: PgDb) {
  return pgdb.public.referrals.count({
    referrerId: referrerId,
  })
}

export function fetchCampaignBySlug(slug: string, pgdb: PgDb) {
  return pgdb.public.campaigns.findOne({
    slug: slug,
  })
}
