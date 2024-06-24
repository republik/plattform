import React, { useEffect } from 'react'

import { renderMdast } from '@republik/mdast-react-render'
import { NEWSLETTER_ID, PUBLIC_BASE_URL } from '../../lib/publicEnv'

import Layout, { Paragraph, List, ListItem } from '../../src/Layout'
import {
  createNewsletterWebSchema,
  Loader,
  Center,
} from '@project-r/styleguide'
import { splitByTitle } from '../../src/utils/helpers'
import StatusError from '../../src/StatusError'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import { gql, useQuery } from '@apollo/client'
import {
  createGetStaticPaths,
  createGetStaticProps,
} from '../../lib/apollo/helpers'
const styles = {
  prepub: css({
    position: 'absolute',
    background: '#E9A733',
    width: '100%',
    padding: '2px 5px',
    color: '#ffffff',
    zIndex: 10,
  }),
}

const schema = createNewsletterWebSchema({ Paragraph, List, ListItem })

const getDocuments = gql`
query getAllNewsletters {
  documents(format: "${NEWSLETTER_ID}") {
    totalCount
    nodes {
      repoId
      meta {
        path
      }
    }
  }
}`

export const getDocument = gql`
  query getDocument($path: String!) {
    newsletter: document(path: $path) {
      content
      meta {
        publishDate
        prepublication
        slug
        path
        title
        description
        image
        facebookTitle
        facebookImage
        facebookDescription
        twitterTitle
        twitterImage
        twitterDescription
        seoTitle
        seoDescription
        shareText
        shareFontSize
        shareInverted
        shareTextPosition
        format {
          meta {
            externalBaseUrl
          }
        }
      }
    }
  }
`

const Newsletter = ({ newsletter }) => {
  const meta = {
    ...newsletter.meta,
    url: `${PUBLIC_BASE_URL}/newsletter${newsletter.meta.path}`,
  }
  const splitContent = splitByTitle(newsletter.content)
  return (
    <Layout raw meta={meta}>
      {meta.prepublication && <div {...styles.prepub}>Editoren-Vorschau</div>}
      {splitContent.title && (
        <>
          {renderMdast(splitContent.title, schema)}
          <Center>
            <h1>{meta.title}</h1>
            <p>
              <b>{meta.description}</b>
            </p>
          </Center>
        </>
      )}
      {renderMdast(splitContent.main, schema)}
    </Layout>
  )
}

const NewsletterPage = () => {
  const router = useRouter()
  const path = '/' + router.query.path.join('/')

  const { data, loading, error, refetch } = useQuery(getDocument, {
    variables: {
      path,
    },
  })

  // Reload on client side when in preview mode
  useEffect(() => {
    if (!loading && !data?.newsletter && path.includes('/vorschau/')) {
      refetch()
    }
  }, [loading, data, path, refetch])

  return (
    <Loader
      loading={loading}
      error={error}
      render={() =>
        data?.newsletter ? (
          <Newsletter newsletter={data?.newsletter} />
        ) : (
          <StatusError
            path={path}
            externalBaseUrl={`${PUBLIC_BASE_URL}/newsletter`}
          />
        )
      }
    />
  )
}

export default NewsletterPage

// static gen

export const getStaticPaths = createGetStaticPaths(async (client) => {
  const res = await client.query({
    query: getDocuments,
  })

  const paths = res.data.documents.nodes.map((doc) => ({
    params: {
      path: doc.meta.path.split('/').filter(Boolean),
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
})

export const getStaticProps = createGetStaticProps(async (client, ctx) => {
  const path = '/' + ctx.params.path.join('/')

  const res = await client.query({
    query: getDocument,
    variables: {
      path,
    },
  })

  if (!res.data.newsletter) {
    return {
      notFound: true,
      revalidate: 60,
    }
  }

  return {
    props: {
      data: res.data,
    },
    revalidate: 60 * 5,
  }
})
