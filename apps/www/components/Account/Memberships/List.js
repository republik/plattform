import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'

import { Interaction, Loader } from '@project-r/styleguide'

import withT from '../../../lib/withT'
import withMe from '../../../lib/apollo/withMe'

import { MyBelongingsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import Manage from './Manage'
import Box from '../../Frame/Box'
import AccountSection from '../AccountSection'

const MembershipsList = ({
  memberships,
  t,
  loading,
  error,
  highlightId,
  activeMembership,
  hasWaitingMemberships,
}) => {
  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        if (!memberships.length) {
          return null
        }

        return (
          <>
            <AccountSection
              id='abos'
              title={t.pluralize('memberships/title', {
                count: memberships.length,
              })}
            >
              {!activeMembership && (
                <Box style={{ padding: '15px 20px', margin: '1em 0em' }}>
                  <Interaction.P>{t('memberships/noActive')}</Interaction.P>
                </Box>
              )}
              {memberships.map((membership) => (
                <Manage
                  key={membership.id}
                  membership={membership}
                  highlighted={highlightId === membership.pledge.id}
                  activeMembership={activeMembership}
                  hasWaitingMemberships={hasWaitingMemberships}
                />
              ))}
            </AccountSection>
          </>
        )
      }}
    />
  )
}

export default compose(
  withMe,
  graphql(MyBelongingsDocument, {
    props: ({ data, ownProps: { me } }) => {
      const memberships =
        (!data.loading &&
          !data.error &&
          data.me &&
          data.me.memberships &&
          data.me.memberships.filter(
            (m) =>
              m.pledge.package.group !== 'GIVE' ||
              (me.id === m.user.id && !m.voucherCode && !m.accessGranted),
          )) ||
        []

      const activeMembership = memberships.find(
        (membership) => membership.active,
      )

      return {
        loading: data.loading,
        error: data.error,
        activeMembership,
        memberships,
        hasWaitingMemberships: data?.me?.hasDormantMembership,
      }
    },
  }),
  withT,
)(MembershipsList)
