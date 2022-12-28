import { css } from 'glamor'
import { Button, Interaction } from '@project-r/styleguide'
import { ClimatelabColors } from '../ClimatelabColors'
import {
  CLIMATE_LAB_ACCESS_CAMPAIGN_ID,
  CLIMATE_LAB_CONTEXT,
  CLIMATE_LAB_ROLE,
  CLIMATE_LAB_URL,
} from '../constants'
import TrialForm from '../../Trial/Form'
import { useMe } from '../../../lib/context/MeContext'
import { t } from '../../../lib/withT'

const ClimateLabTrialform = () => {
  const { me } = useMe()
  const isInClimateLab = me?.roles.some((role) => role === CLIMATE_LAB_ROLE)

  if (isInClimateLab) {
    return (
      <div {...styles.wrapper}>
        <Interaction.H3>
          {t('Climate/Trial/Heading/CampaignMember')}
        </Interaction.H3>
        <Button primary href={CLIMATE_LAB_URL} style={{ marginTop: 20 }}>
          {t('Climate/Trial/Action/CampaignMember')}
        </Button>
      </div>
    )
  }

  return (
    <div {...styles.wrapper}>
      <div>
        <Interaction.H3 style={{ marginBottom: -10 }}>
          {t('Climate/Trial/Heading/NonCampaignMember')}
        </Interaction.H3>
        <TrialForm
          accessCampaignId={CLIMATE_LAB_ACCESS_CAMPAIGN_ID}
          campaign='climate'
          context={CLIMATE_LAB_CONTEXT}
          skipForMembers={false}
          shouldSkipTrialForm={isInClimateLab}
          payload={{}}
        />
      </div>
    </div>
  )
}

export default ClimateLabTrialform

const styles = {
  wrapper: css({
    backgroundColor: 'white',
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ClimatelabColors.border,
    padding: 20,
    '> * + *': {
      maringTop: 20,
    },
  }),
}
