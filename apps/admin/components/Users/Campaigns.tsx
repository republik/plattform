import { A, IconButton, Loader } from '@project-r/styleguide'
import { DD, DL, Section, SectionTitle } from '../Display/utils'
import { REPUBLIK_FRONTEND_URL } from '../../server/constants'
import { IconContentCopy } from '../../../../packages/icons/dist/index.cjs'
import { css } from 'glamor'
import { useQuery } from '@apollo/client'
import { UserCampaignDetailsDocument } from '#graphql/republik-api/__generated__/gql/graphql'

export default function Campaigns({ userId }: { userId: string }) {
  const { data, loading } = useQuery(UserCampaignDetailsDocument, {
    variables: {
      id: userId,
    },
  })

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
