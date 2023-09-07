import { gql } from "@/generated/graphql"

export const BOOKMARKS_COLLECTION_NAME = 'bookmarks'

export const onDocumentFragment = gql(`
fragment BookmarkOnDocument on Document {
  userBookmark: userCollectionItem(collectionName: "${BOOKMARKS_COLLECTION_NAME}") {
    id
    createdAt
  }
}
`)
