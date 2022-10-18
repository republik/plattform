import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { withRouter } from 'next/router'
import { timeDay } from 'd3-time'

import { withMe } from '@project-r/styleguide'
import withInNativeApp from '../../lib/withInNativeApp'

import { STATUS_POLL_INTERVAL_MS } from '../../lib/constants'

const END_DATE = '2020-03-31T10:00:00.000Z'

const CROWDFUNDING_NAME = 'SURVIVE'

const statusQuery = gql`
  query SurviveStatus {
    crowdfunding(name: "MARCH20") {
      goals {
        people
        memberships
        money
        description
      }
    }
    revenueStats {
      surplus(min: "2019-11-30T23:00:00Z", max: "${END_DATE}") {
        total
        updatedAt
      }
    }
    membershipStats {
      count
      marchCount: countRange(
        min: "2020-02-29T23:00:00Z"
        max: "2020-03-31T23:00:00Z"
      )
      evolution(min: "2019-12", max: "2020-03") {
        buckets {
          key

          gaining

          ending
          expired
          cancelled

          activeEndOfMonth

          pending
          pendingSubscriptionsOnly
        }
        updatedAt
      }
    }
  }
`

export const userSurviveActionsFragment = `
  fragment SurviveActionsOnUser on User {
    id
    customPackages {
      options {
        membership {
          id
          user {
            id
          }
          graceEndDate
        }
        defaultAmount
        reward {
          ... on MembershipType {
            name
          }
        }
      }
    }
  }
`

const actionsQuery = gql`
  query SurviveStatusActions($accessToken: ID) {
    actionMe: me(accessToken: $accessToken) {
      id
      ...SurviveActionsOnUser
    }
    questionnaire(slug: "1-minute") {
      id
      turnout {
        submitted
      }
      userIsEligible
      userHasSubmitted
      endDate
    }
  }
  ${userSurviveActionsFragment}
`

export const mapActionData = ({
  data: { loading, actionMe, questionnaire },
  ownProps: { me },
}) => {
  const isOptionWithOwn = (o) =>
    o.membership && o.membership.user && o.membership.user.id === actionMe.id
  const customPackageWithOwn =
    actionMe &&
    actionMe.customPackages &&
    actionMe.customPackages.find((p) => p.options.some(isOptionWithOwn))
  const ownMembership =
    customPackageWithOwn &&
    customPackageWithOwn.options.find(isOptionWithOwn).membership

  const canProlongOwn = !!customPackageWithOwn
  const activeMembership = me && me.activeMembership
  const numberOfDaysLeft =
    canProlongOwn &&
    activeMembership &&
    timeDay.count(new Date(), new Date(me.activeMembership.endDate))
  const shouldBuyProlong = canProlongOwn && (!me || numberOfDaysLeft < 31)
  const qHasEnded =
    questionnaire && new Date() > new Date(questionnaire.endDate)

  return {
    actionsLoading: loading,
    questionnaire: {
      ...questionnaire,
      hasEnded: qHasEnded,
      shouldAnswer:
        questionnaire &&
        questionnaire.userIsEligible &&
        !questionnaire.userHasSubmitted &&
        !qHasEnded,
    },
    activeMembership,
    shouldBuyProlong,
    isReactivating:
      ownMembership && new Date(ownMembership.graceEndDate) < new Date(),
    defaultBenefactor:
      !!customPackageWithOwn &&
      actionMe.customPackages.some((p) =>
        p.options.some(
          (o) =>
            isOptionWithOwn(o) &&
            o.defaultAmount === 1 &&
            o.reward.name === 'BENEFACTOR_ABO',
        ),
      ),
  }
}

export const withSurviveActions = compose(
  withMe,
  withRouter,
  graphql(actionsQuery, {
    props: mapActionData,
    options: ({ router: { query } }) => ({
      variables: {
        accessToken: query.token,
      },
    }),
  }),
)

const withSurviveStatus = compose(
  withInNativeApp,
  graphql(statusQuery, {
    options: {
      pollInterval: +STATUS_POLL_INTERVAL_MS,
    },
    props: ({ data, ownProps: { questionnaire } }) => {
      const { evolution, count, marchCount } = data.membershipStats || {}
      const lastMonth =
        evolution && evolution.buckets[evolution.buckets.length - 1]
      return {
        surviveData: data,
        crowdfunding: data.crowdfunding &&
          lastMonth &&
          data.revenueStats && {
            name: CROWDFUNDING_NAME,
            endDate: END_DATE,
            goals: data.crowdfunding.goals,
            status: {
              memberships: marchCount,
              people:
                lastMonth.activeEndOfMonth + lastMonth.pendingSubscriptionsOnly,
              money: data.revenueStats.surplus.total,
              support:
                questionnaire && questionnaire.turnout
                  ? questionnaire.turnout.submitted
                  : undefined,
            },
          },
      }
    },
  }),
)

export default withSurviveStatus
