import React from 'react'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import TrialForm from '../Trial/Form'
import { TRIAL_CAMPAIGNS, TRIAL_CAMPAIGN } from '../../lib/constants'
import { parseJSONObject } from '../../lib/safeJSON'

const trailCampaignes = parseJSONObject(TRIAL_CAMPAIGNS)

const trialAccessCampaignId =
  (trailCampaignes.wahltindaer &&
    trailCampaignes.wahltindaer.accessCampaignId) ||
  TRIAL_CAMPAIGN

const Form = ({ router, redirect }) => (
  <TrialForm
    onBeforeSignIn={() => {
      router.push(
        {
          pathname: '/wahltindaer/[group]/[suffix]',
          query: {
            group: router.query.group,
            suffix: router.query.suffix,
            stale: 1,
          },
        },
        router.asPath,
        { shallow: true },
      )
    }}
    onSuccess={() => {
      if (!redirect) {
        router.replace(
          {
            pathname: '/wahltindaer/[group]/[suffix]',
            query: { group: router.query.group, suffix: router.query.suffix },
          },
          undefined,
          { shallow: true },
        )
        return false
      }
      return true
    }}
    accessCampaignId={trialAccessCampaignId}
    narrow
  />
)

export default compose(withRouter)(Form)
