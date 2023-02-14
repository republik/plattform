import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

export const MARKETING_CAROUSEL_QUERY = gql`
  query MarketingCarouselQuery {
    carousel: document(path: "/marketing") {
      id
      content
    }
  }
`

type CarouselData = {
  carousel: {
    id: string
    content?: Record<string, any>
  }
}

export const useCarouselQuery = makeQueryHook<CarouselData>(
  MARKETING_CAROUSEL_QUERY,
)
