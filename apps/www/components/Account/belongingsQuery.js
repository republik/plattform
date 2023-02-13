import { gql } from '@apollo/client'

export default gql`
  query myBelongings {
    me {
      id
      hasDormantMembership
      memberships {
        id
        accessGranted
        claimerName
        voucherCode
        createdAt
        sequenceNumber
        renew
        active
        overdue
        autoPay
        autoPayIsMutable
        canProlong
        user {
          id
        }
        pledge {
          id
          package {
            name
            group
            company {
              id
              name
            }
          }
          options {
            price
            reward {
              ... on MembershipType {
                name
              }
            }
          }
        }
        periods {
          beginDate
          endDate
        }
        type {
          name
        }
      }
      accessGrants {
        endAt
        beginAt
        campaign {
          id
          title
          description
          type
        }
      }
      pledges {
        id
        package {
          name
          group
          company {
            id
            name
          }
        }
        options {
          templateId
          reward {
            ... on MembershipType {
              name
              interval
            }
            ... on Goodie {
              name
            }
          }
          minAmount
          maxAmount
          amount
          periods
          price
          accessGranted
          membership {
            id
            user {
              id
              name
            }
            sequenceNumber
          }
          additionalPeriods {
            endDate
          }
        }
        status
        total
        donation
        payments {
          method
          total
          status
          paymentslipUrl
          createdAt
        }
        memberships {
          id
          claimerName
          voucherCode
          createdAt
          sequenceNumber
          type {
            name
          }
        }
        createdAt
      }
    }
  }
`
