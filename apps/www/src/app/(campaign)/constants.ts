export const CAMPAIGN_SLUG = 'autumn-2025'
export const CAMPAIGN_REFERRALS_GOAL = 1000

export const CAMPAIGN_META_ARTICLE_URL =
  '/2024/02/29/sie-kennen-wen-der-uns-nicht-kennt'
export const CAMPAIGN_META_ARTICLE_DIALOG_URL =
  '/dialog?t=article&id=7c6ccf10-6e86-45a0-a6de-d62130dc3146'
export const UNELIGIBLE_RECEIVER_MEMBERSHIPS = [
  'ABO',
  'YEARLY_ABO',
  'BENEFACTOR_ABO',
]
// not really a const but hey!
export const getCampaignMemberBannerText = (referralCount: number): string => {
  const pct = ((referralCount / CAMPAIGN_REFERRALS_GOAL) * 100).toFixed(0)
  return `Unsere Kampagne hat Erfolg: Wir stehen bei ${pct}% unseres Ziels von 1000 neuen Verlegerinnen und Verlegern. Wie viele schaffen wir bis zum 31. März?`
}
