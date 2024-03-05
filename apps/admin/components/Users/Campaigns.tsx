import { A, IconButton, Loader } from '@project-r/styleguide'
import { DD, DL, Section, SectionTitle } from '../Display/utils'
import { REPUBLIK_FRONTEND_URL } from '../../server/constants'
import { IconContentCopy } from '../../../../packages/icons/dist/index.cjs'
import { css } from 'glamor'
import { gql, useQuery } from '@apollo/client'

const USER_CAMPAIGN_DETAILS = gql`
  query UserCampaignDetails($id: ID!) {
    user(id: $id) {
      username
      referralCode
      hasPublicProfile
    }
  }
`

type UserCampaignDetailsData = {
  user?: {
    username?: string
    referralCode: string
    hasPublicProfile?: boolean
  }
}

export default function Campaigns({ userId }: { userId: string }) {
  const { data, loading } = useQuery<UserCampaignDetailsData>(
    USER_CAMPAIGN_DETAILS,
    {
      variables: {
        id: userId,
      },
    },
  )
  const userCode = data?.user?.hasPublicProfile
    ? data?.user.username
    : data?.user.referralCode

  const campaignUrl = `${REPUBLIK_FRONTEND_URL}/jetzt/${userCode}`

  return (
    <Section>
      <SectionTitle>Kampagne 2024</SectionTitle>
      <Loader
        loading={loading}
        render={() => (
          <>
            <DL>
              <DD>
                <div
                  {...css({
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  })}
                >
                  <A href={campaignUrl} target='_blank'>
                    {campaignUrl}
                  </A>
                  <IconButton
                    size={16}
                    Icon={IconContentCopy}
                    onClick={() => navigator.clipboard.writeText(campaignUrl)}
                  />
                </div>
              </DD>
            </DL>
          </>
        )}
      />
    </Section>
  )
}
