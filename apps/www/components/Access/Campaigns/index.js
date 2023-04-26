import compose from 'lodash/flowRight'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import Link from 'next/link'

import Campaign from './Campaign'
import Loader from '../../Loader'

import { Interaction, Button } from '@project-r/styleguide'
import withT from '../../../lib/withT'
import useInNativeApp from '../../../lib/withInNativeApp'

const query = gql`
  query accessCampaigns {
    me {
      id
      accessCampaigns {
        id
        title
        type
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
  const { inNativeIOSApp } = useInNativeApp()
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
                {!inNativeIOSApp && (
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
