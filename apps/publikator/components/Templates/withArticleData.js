import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { TeaserEmbedComment } from '@project-r/styleguide'

export const withCommentData = graphql(
  gql`
    ${TeaserEmbedComment.data.query}
  `,
  TeaserEmbedComment.data.config,
)
