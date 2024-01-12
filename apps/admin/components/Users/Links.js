import { gql, useQuery } from '@apollo/client'
import { Label, A } from '@project-r/styleguide'

import { REPUBLIK_FRONTEND_URL } from '../../server/constants'
import { DD, DL, Section, SectionTitle } from '../Display/utils'
import ErrorMessage from '../ErrorMessage'

const GET_ACCESS_TOKENS = gql`
  query getAccessTokens($userId: String) {
    user(slug: $userId) {
      id
      submitPledge: accessToken(scope: SUBMIT_PLEDGE)
    }
  }
`

const Links = ({ userId }) => {
  const { data, loading, error } = useQuery(GET_ACCESS_TOKENS, {
    variables: { userId },
  })

  const submitPledge = data?.user?.submitPledge

  return (
    <Section>
      <SectionTitle>Links</SectionTitle>
      {!loading && (
        <DL>
          {submitPledge && (
            <DD>
              <A
                href={`${REPUBLIK_FRONTEND_URL}/angebote?package=PROLONG&token=${submitPledge}`}
                target='_blank'
              >
                Verlängerungs-Link
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
