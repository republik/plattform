import { gql } from '@apollo/client'
import {
  makeMutationHook,
  makeQueryHook,
} from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

const DONATE_MONTHS_CONSENT_QUERY = gql`
  query DonateMonthsConsentQuery($name: String!) {
    me {
      id
      hasConsentedTo(name: $name)
    }
  }
`
type DonateMonthsConsentQuery = {
  data: {
    me?: {
      hasConsentedTo?: boolean | null
    }
  }
  variables: {
    name: string
  }
}

export const useDonateMonthsConsentQuery = makeQueryHook<
  DonateMonthsConsentQuery['data'],
  DonateMonthsConsentQuery['variables']
>(DONATE_MONTHS_CONSENT_QUERY)

const GIVE_CONSENT_TO_DONATE_MONTHS_MUTATION = gql`
  mutation GiveConsentToDonateMonths($name: String!) {
    submitConsent(name: $name) {
      id
      hasConsentedTo(name: $name)
    }
  }
`

type GiveConsentToDonateMonthsMutation = {
  data: {
    submitConsent: {
      hasConsentedTo?: boolean | null
    }
  }
  variables: {
    name: string
  }
}

export const useGiveConsentToDonateMonthsMutation = makeMutationHook<
  GiveConsentToDonateMonthsMutation['data'],
  GiveConsentToDonateMonthsMutation['variables']
>(GIVE_CONSENT_TO_DONATE_MONTHS_MUTATION)

const REVOKE_CONSENT_TO_DONATE_MONTHS_MUTATION = gql`
  mutation RevokeConsentToDonateMonths($name: String!) {
    revokeConsent(name: $name) {
      id
      hasConsentedTo(name: $name)
    }
  }
`

type RevokeConsentToDonateMonthsMutation = {
  data: {
    revokeConsent: {
      hasConsentedTo?: boolean | null
    }
  }
  variables: {
    name: string
  }
}

export const useRevokeConsentToDonateMonthsMutation = makeMutationHook<
  RevokeConsentToDonateMonthsMutation['data'],
  RevokeConsentToDonateMonthsMutation['variables']
>(REVOKE_CONSENT_TO_DONATE_MONTHS_MUTATION)
