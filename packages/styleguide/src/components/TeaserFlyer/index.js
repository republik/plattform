import React from 'react'
import { TeaserSectionTitle } from '../TeaserShared'
import { NarrowContainer } from '../Grid'

const DefaultLink = ({ children }) => children

const TeaserFlyer = ({
  contentTree,
  formatTitle,
  href,
  Link = DefaultLink,
}) => {
  return (
    <>
      <NarrowContainer>
        {/* Render contentTree */}
        <Link href={href} passHref>
          <TeaserSectionTitle href={href}>{formatTitle}</TeaserSectionTitle>
        </Link>
      </NarrowContainer>
    </>
  )
}

const WrappedTeaserFlyer = (props) => <TeaserFlyer {...props} />

export default TeaserFlyer

WrappedTeaserFlyer.data = {
  config: {
    props: ({ data }) => {
      const node = data.nodes[0]
      return {
        data: {
          loading: data.loading,
          error: data.error,
          href: node?.meta.path,
          formatTitle: node?.meta.format.meta.title,
          content: node?.content,
        },
      }
    },
  },
  query: `
    query getLatestFlyer() {
      latestFlyer: documents(format: "republik/format-journal", first: 1) {
        nodes {
          id
          meta {
            title
            path
            format {
              meta {
                title
              }
            }
          }
          content
        }
      }
    }
  `,
}
