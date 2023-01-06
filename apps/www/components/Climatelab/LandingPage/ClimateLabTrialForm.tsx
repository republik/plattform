import { css } from 'glamor'
import {
  Button,
  Interaction,
  useColorContext,
  Loader,
} from '@project-r/styleguide'
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
  const [colorScheme] = useColorContext()
  const { me, meLoading } = useMe()
  const isInClimateLab = me?.roles.some((role) => role === CLIMATE_LAB_ROLE)

  return (
    <div
      {...styles.wrapper}
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('borderColor', 'climateBorder')}
    >
      <Loader
        loading={meLoading}
        render={() => (
          <>
            {isInClimateLab ? (
              <>
                <Interaction.H3>
                  {t('Climate/Trial/Heading/CampaignMember')}
                </Interaction.H3>
                <Button
                  primary
                  href={CLIMATE_LAB_URL}
                  style={{ marginTop: 20 }}
                >
                  {t('Climate/Trial/Action/CampaignMember')}
                </Button>
              </>
            ) : (
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
            )}
          </>
        )}
      />
    </div>
  )
}

export default ClimateLabTrialform

const styles = {
  wrapper: css({
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 20,
    '> * + *': {
      maringTop: 20,
    },
  }),
}
