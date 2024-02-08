function fetchReferralCountByReferrerId(referrerId, pgdb) {
  return pgdb.public.referrals.count({
    referrerId: referrerId,
  })
}

function fetchCampaignBySlug(slug, pgdb) {
  return pgdb.public.campaigns.findOne({
    slug: slug,
  })
}

module.exports = {
  fetchCampaignBySlug,
  fetchReferralCountByReferrerId,
}
