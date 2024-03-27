import dayjs = require('dayjs')
import isBetween = require('dayjs/plugin/isBetween')
import { Campaign } from '../graphql/types'
import { CampaignRow } from './types'
dayjs.extend(isBetween)

export function transformCampaign(campaign: CampaignRow): Campaign {
  const now = new Date()

  const isActive = dayjs(now).isBetween(campaign.beginDate, campaign.endDate)
  return Object.assign({}, campaign, { isActive: isActive })
}
