import { gql } from '@apollo/client'
import {
  makeMutationHook,
  makeQueryHook,
} from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { AUDIO_AUTOPLAY_OPTOUT } from '../constants'

const GET_MY_AUTOPLAY_CONSENT = gql`
  query GetMyAutoplayConsent {
    me {
      id
      shouldNotAutoPlay: hasConsentedTo(name: "${AUDIO_AUTOPLAY_OPTOUT}")
    }
  }
`

type GetMyAutoplayConsentQuery = {
  me: {
    shouldNotAutoPlay: boolean
  }
}

export const useAudioAutoPlayPrefQuery =
  makeQueryHook<GetMyAutoplayConsentQuery>(GET_MY_AUTOPLAY_CONSENT)

const ADD_AUDIO_AUTOPLAY_OPTOUT_CONSENT = gql`
  mutation ConsentToAudioAutoPlayOptOut {
      submitConsent(name: "${AUDIO_AUTOPLAY_OPTOUT}") {
        id
        shouldNotAutoPlay: hasConsentedTo(name: "${AUDIO_AUTOPLAY_OPTOUT}")
      }
  }
`

const REMOVE_AUDIO_AUTOPLAY_OPTOUT_CONSENT = gql`
  mutation ConsentToAudioAutoPlayOptOut {
      revokeConsent(name: "${AUDIO_AUTOPLAY_OPTOUT}") {
        id
        shouldNotAutoPlay: hasConsentedTo(name: "${AUDIO_AUTOPLAY_OPTOUT}")
      }
  }
`

export const useConsentToAudioAutoPlayOptOutMutation = makeMutationHook(
  ADD_AUDIO_AUTOPLAY_OPTOUT_CONSENT,
)

export const useRevokeAudioAutoPlayOptOutMutation = makeMutationHook(
  REMOVE_AUDIO_AUTOPLAY_OPTOUT_CONSENT,
)
