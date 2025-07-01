import { gql } from '@apollo/client'

export const SimpleCommit = gql`
  fragment SimpleCommit on Commit {
    id
    message
    parentIds
    date
    author {
      email
      name
    }
  }
`

export const SimpleDerivative = gql`
  fragment SimpleDerivative on Derivative {
    id
    type
    status
    result
  }
`

export const CommitWithDocument = gql`
  fragment CommitWithDocument on Commit {
    ...SimpleCommit
    document {
      id
      repoId
      type
      content
      meta {
        title
        template
        kind
        color
        audioCoverCrop {
          x
          y
          width
          height
        }
        format {
          id
          repoId
          meta {
            title
            color
            kind
            image
            shareLogo
            shareBackgroundImage
            shareBackgroundImageInverted
            sendAsEmail
            section {
              id
              meta {
                title
              }
            }
          }
        }
        section {
          id
          repoId
          meta {
            title
            color
            kind
          }
        }
        series {
          title
          description
          logo
          logoDark
          overview {
            id
            repoId
            meta {
              path
            }
          }
          episodes {
            title
            publishDate
            label
            lead
            image
            document {
              id
              repoId
              meta {
                path
              }
            }
          }
        }
      }
    }
  }
  ${SimpleCommit}
`

export const SimpleMilestone = gql`
  fragment SimpleMilestone on Milestone {
    name
    message
    immutable
    commit {
      id
    }
    author {
      email
      name
    }
  }
`

export const MilestoneWithCommit = gql`
  fragment MilestoneWithCommit on Milestone {
    name
    message
    immutable
    commit {
      ...SimpleCommit
    }
    author {
      name
    }
  }
  ${SimpleCommit}
`

export const EditPageRepo = gql`
  fragment EditPageRepo on Repo {
    id
    isArchived
    isTemplate
    meta {
      publishDate
    }
  }
`

export const RepoFile = gql`
  fragment RepoFile on RepoFile {
    id
    name
    status
    url
    error
    author {
      name
    }
    createdAt
  }
`
