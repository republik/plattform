import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

import { Button, Interaction } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import useInNativeApp from '../../../lib/withInNativeApp'
import withT from '../../../lib/withT'
import Loader from '../../Loader'

import Campaign from './Campaign'

const query = gql`
  query accessCampaigns {
    me {
      id
      accessCampaigns {
        id
        title
        description
        defaultMessage
        grants {
          id
          email
          voucherCode
          beginBefore
          beginAt
          endAt
        }
        slots {
          total
          used
          free
        }
        perks {
          giftableMemberships
        }
      }
    }
  }
`

const Campaigns = ({ t, data, grantAccess, revokeAccess }) => {
  const { inNativeApp } = useInNativeApp()
  return (
    <>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          if (!data.me) {
            return null
          }
          if (!data.me.accessCampaigns) {
            return (
              <>
                <Interaction.P>
                  {t('Account/Access/Page/noCampaign')}
                </Interaction.P>
                {!inNativeApp && (
                  <Link href='/angebote' passHref legacyBehavior>
                    <Button style={{ marginTop: 24, marginBottom: 24 }} primary>
                      {t('Account/Access/Page/link')}
                    </Button>
                  </Link>
                )}
              </>
            )
          }
          return (
            <>
              {data.me.accessCampaigns.map((campaign, key) => (
                <Campaign
                  key={`campaign-${key}`}
                  campaign={campaign}
                  grantAccess={grantAccess}
                  revokeAccess={revokeAccess}
                />
              ))}
            </>
          )
        }}
      />
    </>
  )
}

const grantMutation = gql`
  mutation grantAccess($campaignId: ID!, $email: String!, $message: String) {
    grantAccess(campaignId: $campaignId, email: $email, message: $message) {
      email
      endAt
    }
  }
`

const revokeMutation = gql`
  mutation revokeAccess($id: ID!) {
    revokeAccess(id: $id)
  }
`

export default compose(
  withT,
  graphql(grantMutation, {
    props: ({ mutate }) => ({
      grantAccess: (variables) =>
        mutate({
          variables,
          refetchQueries: [
            {
              query,
            },
          ],
        }),
    }),
  }),
  graphql(revokeMutation, {
    props: ({ mutate }) => ({
      revokeAccess: (variables) =>
        mutate({
          variables,
          refetchQueries: [
            {
              query,
            },
          ],
        }),
    }),
  }),
  graphql(query, {
    props: ({ data }) => ({
      data,
    }),
  }),
)(Campaigns)
