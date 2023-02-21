import { gql, useQuery } from '@apollo/client'
import { Label, A } from '@project-r/styleguide'

import { REPUBLIK_FRONTEND_URL } from '../../server/constants'
import { DD, DL, Section, SectionTitle } from '../Display/utils'
import ErrorMessage from '../ErrorMessage'

const GET_ACCESS_TOKENS = gql`
  query getAccessTokens($userId: String) {
    user(slug: $userId) {
      id
      customPledge: accessToken(scope: CUSTOM_PLEDGE)
      nowYouSeeMe: accessToken(scope: NOW_YOU_SEE_ME)
    }
  }
`

const Links = ({ userId }) => {
  const { data, loading, error } = useQuery(GET_ACCESS_TOKENS, {
    variables: { userId },
  })

  const customPledge = data?.user?.customPledge
  const nowYouSeeMe = data?.user?.nowYouSeeMe

  return (
    <Section>
      <SectionTitle>Links</SectionTitle>
      {!loading && (
        <DL>
          {customPledge && (
            <DD>
              <A
                href={`${REPUBLIK_FRONTEND_URL}/angebote?package=PROLONG&token=${customPledge}`}
                target='_blank'
              >
                Verlängerungs-Link
              </A>
            </DD>
          )}
          {nowYouSeeMe && (
            <DD>
              <A
                href={`${REPUBLIK_FRONTEND_URL}/5-jahre-republik/${nowYouSeeMe}`}
                target='_blank'
              >
                Mitstreiter-Abo Einladungs-Link
              </A>
            </DD>
          )}
        </DL>
      )}
      {error && <ErrorMessage error={error} />}

      <Label>
        Magic-Links für diesen User. In einem neuen, privaten Fenster öffnen.
      </Label>
    </Section>
  )
}

export default Links
