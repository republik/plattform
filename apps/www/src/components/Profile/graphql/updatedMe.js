import { gql } from '@apollo/client'

export const updateMe = gql`
  mutation updateMe(
    $username: String
    $hasPublicProfile: Boolean
    $profileUrls: JSON
    $emailAccessRole: AccessRole
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
      profileUrls: $profileUrls
      emailAccessRole: $emailAccessRole
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
      profileUrls
      emailAccessRole
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
