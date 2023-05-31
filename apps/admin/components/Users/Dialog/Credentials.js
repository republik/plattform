import { useState } from 'react'
import { Query, Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
import { Checkbox, Loader, InlineSpinner } from '@project-r/styleguide'

import { IconDone } from '@republik/icons'

import {
  InteractiveSection,
  Section,
  SectionTitle,
  TextButton,
} from '../../Display/utils'

const GET_CREDENTIALS = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      credentials {
        id
        description
        verified
        isListed
      }
    }
  }
`

const VERIFY_CREDENTIAL = gql`
  mutation verifyCredential($id: ID!) {
    verifyCredential(id: $id) {
      id
    }
  }
`

const REMOVE_CREDENTIAL_VERIFICATION = gql`
  mutation removeCredentialVerification($id: ID!) {
    removeCredentialVerification(id: $id) {
      id
    }
  }
`
const UpdateCredential = ({
  credential: { id: credentialId, description, verified, isListed },
  user: { id: userId },
}) => {
  const [value, setValue] = useState(verified)
  const handleSubmit = (mutation) => (event) => {
    event.preventDefault()
    mutation()
  }
  return (
    <Mutation
      mutation={value ? VERIFY_CREDENTIAL : REMOVE_CREDENTIAL_VERIFICATION}
      variables={{ id: credentialId }}
      refetchQueries={() => [
        {
          query: GET_CREDENTIALS,
          variables: {
            id: userId,
          },
        },
      ]}
    >
      {(mutation, { loading }) => {
        return (
          <form onSubmit={handleSubmit(mutation)}>
            <p>
              <Checkbox
                checked={value}
                disabled={loading}
                onChange={(_, checked) => setValue(checked)}
              >
                {description} <span>{isListed ? '(Profil-Rolle)' : ''}</span>
              </Checkbox>
              <span style={{ float: 'right' }}>
                {loading ? (
                  <InlineSpinner size={22} />
                ) : verified !== value ? (
                  <TextButton type='submit'>
                    <IconDone size={22} />
                  </TextButton>
                ) : null}
              </span>
            </p>
          </form>
        )
      }}
    </Mutation>
  )
}

const Credentials = ({ userId }) => {
  return (
    <Query query={GET_CREDENTIALS} variables={{ id: userId }}>
      {({ loading, error, data }) => {
        const isInitialLoading = loading && !(data && data.user)
        return (
          <Loader
            loading={isInitialLoading}
            error={error}
            render={() => {
              const { user } = data
              const { credentials } = user

              if (!credentials.length) {
                return (
                  <Section>
                    <SectionTitle>Rollen verifizieren</SectionTitle>
                    Keine (nicht-anonymen) Rollen vorhanden
                  </Section>
                )
              }

              return (
                <InteractiveSection>
                  <SectionTitle>Rollen verifizieren</SectionTitle>
                  {[...credentials]
                    .sort((a) => (a.isListed ? -1 : 0)) // bubble listed credentials to top
                    .map((credential) => (
                      <UpdateCredential
                        key={credential.id}
                        user={user}
                        credential={credential}
                      />
                    ))}
                </InteractiveSection>
              )
            }}
          />
        )
      }}
    </Query>
  )
}

export default Credentials
