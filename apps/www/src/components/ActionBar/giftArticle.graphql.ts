import { gql } from '@apollo/client'

export const GIFT_ARTICLE_STATUS = gql`
  query GiftArticleStatus($documentPath: String!) {
    giftArticleStatus(documentPath: $documentPath) {
      remainingGiftsThisMonth
      maxGiftsPerMonth
      existingLink {
        id
        token
        url
        documentPath
        expiresAt
        createdAt
      }
    }
  }
`

export const CREATE_GIFT_ARTICLE_LINK = gql`
  mutation CreateGiftArticleLink($documentPath: String!) {
    createGiftArticleLink(documentPath: $documentPath) {
      id
      token
      url
      documentPath
      expiresAt
      createdAt
    }
  }
`

export const VALIDATE_GIFT_TOKEN = gql`
  query ValidateGiftToken($token: String!) {
    validateGiftToken(token: $token) {
      valid
      documentPath
      expiresAt
      granter {
        name
        portrait
        hasPublicProfile
      }
    }
  }
`
