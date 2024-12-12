import { gql } from '@apollo/client'

export const updateMe = gql`
  mutation updateMe(
    $username: String
    $hasPublicProfile: Boolean
    $facebookId: String
    $twitterHandle: String
    $emailAccessRole: AccessRole
    $publicUrl: String
    $biography: String
    $statement: String
    $portrait: String
    $phoneNumber: String
    $phoneNumberNote: String
    $phoneNumberAccessRole: AccessRole
    $pgpPublicKey: String
    $isListed: Boolean
    $prolitterisId: String
  ) {
    updateMe(
      username: $username
      hasPublicProfile: $hasPublicProfile
      facebookId: $facebookId
      twitterHandle: $twitterHandle
      emailAccessRole: $emailAccessRole
      publicUrl: $publicUrl
      biography: $biography
      statement: $statement
      portrait: $portrait
      phoneNumber: $phoneNumber
      phoneNumberNote: $phoneNumberNote
      phoneNumberAccessRole: $phoneNumberAccessRole
      pgpPublicKey: $pgpPublicKey
      isListed: $isListed
      prolitterisId: $prolitterisId
    ) {
      id
      username
      hasPublicProfile
      facebookId
      twitterHandle
      emailAccessRole
      publicUrl
      biography
      biographyContent
      statement
      portrait
      phoneNumber
      phoneNumberNote
      phoneNumberAccessRole
      pgpPublicKey
      pgpPublicKeyId
      isListed
      prolitterisId
      credentials {
        isListed
        description
        verified
      }
    }
  }
`
