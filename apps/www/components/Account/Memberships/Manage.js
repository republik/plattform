import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

import { A, colors, InlineSpinner } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { errorToString } from '../../../lib/utils/errors'
import { timeFormat } from '../../../lib/utils/format'
import { useInNativeApp } from '../../../lib/withInNativeApp'

import withT from '../../../lib/withT'

import TokenPackageLink from '../../Link/TokenPackage'
import { Item as AccountItem, P } from '../Elements'

const dayFormat = timeFormat('%d. %B %Y')

const Actions = ({
  t,
  membership,
  activeMembership,
  hasWaitingMemberships,
  reactivate,
  setAutoPay,
}) => {
  const [{ updating, remoteError }, setState] = useState({})
  const { inNativeApp } = useInNativeApp()

  if (updating) {
    return <InlineSpinner />
  }

  if (inNativeApp) {
    return (
      <>
        <P>{t('memberships/manage/native/info')}</P>
        {membership.active && !hasWaitingMemberships && membership.renew && (
          <P>
            <Link
              href={{
                pathname: '/abgang',
                query: { membershipId: membership.id },
              }}
              passHref
              legacyBehavior
            >
              <A>
                {t.first([
                  `memberships/${membership.type.name}/manage/cancel/link`,
                  'memberships/manage/cancel/link',
                ])}
              </A>
            </Link>
          </P>
        )}
      </>
    )
  }

  return (
    <>
      {!hasWaitingMemberships && membership.canProlong && (
        <P>
          <TokenPackageLink
            params={{
              package: 'PROLONG',
            }}
            passHref
          >
            <A>
              {t.first([
                `memberships/${membership.type.name}/manage/prolong/link`,
                'memberships/manage/prolong/link',
              ])}
            </A>
          </TokenPackageLink>
        </P>
      )}
      {!hasWaitingMemberships &&
        !membership.renew &&
        !!membership.periods.length &&
        (membership.active ||
          (membership.type.name === 'MONTHLY_ABO' && !activeMembership)) && (
          <P>
            <A
              href='#reactivate'
              onClick={(e) => {
                e.preventDefault()
                setState({
                  updating: true,
                })
                reactivate({
                  id: membership.id,
                })
                  .then(() => {
                    setState({
                      updating: false,
                      remoteError: undefined,
                    })
                  })
                  .catch((error) => {
                    setState({
                      updating: false,
                      remoteError: errorToString(error),
                    })
                  })
              }}
            >
              {t.first([
                `memberships/${membership.type.name}/manage/reactivate`,
                'memberships/manage/reactivate',
              ])}
            </A>
          </P>
        )}
      {membership.active && (
        <>
          {membership.renew &&
            ['MONTHLY_ABO', 'YEARLY_ABO'].includes(membership.type.name) && (
              <P>
                {t.elements(
                  `memberships/${membership.type.name}/manage/upgrade/link`,
                  {
                    buyLink: (
                      <Link
                        href={{
                          pathname: '/angebote',
                          query: { package: 'ABO' },
                        }}
                        passHref
                        legacyBehavior
                      >
                        <A>
                          {t(
                            `memberships/${membership.type.name}/manage/upgrade/link/buyText`,
                          )}
                        </A>
                      </Link>
                    ),
                  },
                )}
              </P>
            )}
          {!hasWaitingMemberships && (
            <>
              {membership.renew && (
                <>
                  {membership.autoPayIsMutable && (
                    <P>
                      <A
                        href='#autoPay'
                        onClick={(e) => {
                          e.preventDefault()
                          setState({
                            updating: true,
                          })
                          setAutoPay({
                            id: membership.id,
                            autoPay: !membership.autoPay,
                          })
                            .then(() => {
                              setState({
                                updating: false,
                                remoteError: undefined,
                              })
                            })
                            .catch((error) => {
                              setState({
                                updating: false,
                                remoteError: errorToString(error),
                              })
                            })
                        }}
                      >
                        {t.first([
                          `memberships/${membership.type.name}/manage/autoPay/${
                            membership.autoPay ? 'disable' : 'enable'
                          }`,
                          `memberships/manage/autoPay/${
                            membership.autoPay ? 'disable' : 'enable'
                          }`,
                        ])}
                      </A>
                    </P>
                  )}
                  <P>
                    <Link
                      href={{
                        pathname: '/abgang',
                        query: { membershipId: membership.id },
                      }}
                      passHref
                      legacyBehavior
                    >
                      <A>
                        {t.first([
                          `memberships/${membership.type.name}/manage/cancel/link`,
                          'memberships/manage/cancel/link',
                        ])}
                      </A>
                    </Link>
                  </P>
                </>
              )}
            </>
          )}
          {hasWaitingMemberships && !membership.canProlong && (
            <P>{t('memberships/manage/prolong/awaiting')}</P>
          )}
        </>
      )}
      {!!remoteError && (
        <P style={{ color: colors.error, marginTop: 10 }}>{remoteError}</P>
      )}
    </>
  )
}

const cancelMembership = gql`
  mutation cancelMembership($id: ID!, $reason: String) {
    cancelMembership(id: $id, reason: $reason) {
      id
      active
      renew
    }
  }
`

const reactivateMembership = gql`
  mutation reactivateMembership($id: ID!) {
    reactivateMembership(id: $id) {
      id
      active
      renew
    }
  }
`

const setMembershipAutoPay = gql`
  mutation setMembershipAutoPay($id: ID!, $autoPay: Boolean!) {
    setMembershipAutoPay(id: $id, autoPay: $autoPay) {
      id
      autoPay
    }
  }
`

const ManageActions = compose(
  withT,
  graphql(cancelMembership, {
    props: ({ mutate }) => ({
      cancel: (variables) => mutate({ variables }),
    }),
  }),
  graphql(reactivateMembership, {
    props: ({ mutate }) => ({
      reactivate: (variables) => mutate({ variables }),
    }),
  }),
  graphql(setMembershipAutoPay, {
    props: ({ mutate }) => ({
      setAutoPay: (variables) => mutate({ variables }),
    }),
  }),
)(Actions)

const Manage = ({
  t,
  membership,
  highlighted,
  activeMembership,
  hasWaitingMemberships,
  title,
  compact,
  actions = true,
}) => {
  const createdAt = new Date(membership.createdAt)
  const latestPeriod = membership.periods?.[0]

  const endDate = latestPeriod && new Date(latestPeriod.endDate)
  const formattedEndDate = latestPeriod && dayFormat(endDate)
  const overdue = latestPeriod && endDate < new Date()

  return (
    <AccountItem
      compact={compact}
      highlighted={highlighted}
      createdAt={createdAt}
      title={
        title ||
        t(`memberships/title/${membership.type.name}`, {
          sequenceNumber: membership.sequenceNumber,
        })
      }
    >
      {membership.active && !!latestPeriod && !overdue && (
        <P>
          {t.first(
            [
              `memberships/${membership.type.name}/latestPeriod/renew/${membership.renew}/autoPay/${membership.autoPay}`,
              `memberships/latestPeriod/renew/${membership.renew}/autoPay/${membership.autoPay}`,
            ],
            { formattedEndDate },
            '',
          )}
        </P>
      )}
      {membership.active && !!latestPeriod && overdue && (
        <P>
          {t.first(
            [
              `memberships/${membership.type.name}/latestPeriod/overdue`,
              'memberships/latestPeriod/overdue',
            ],
            { formattedEndDate },
          )}
        </P>
      )}
      {!membership.active && !membership.renew && !!latestPeriod && overdue && (
        <P>
          {t.first(
            [
              `memberships/${membership.type.name}/ended`,
              'memberships/latestPeriod/ended',
            ],
            { formattedEndDate },
          )}
        </P>
      )}
      {actions && (
        <ManageActions
          membership={membership}
          activeMembership={activeMembership}
          hasWaitingMemberships={hasWaitingMemberships}
        />
      )}
    </AccountItem>
  )
}

Manage.propTypes = {
  title: PropTypes.string,
  membership: PropTypes.object.isRequired,
  actions: PropTypes.bool,
}

export default compose(withT)(Manage)
