import React from 'react'

import { compose } from 'redux'

import Layout from '../src/Layout'
import Cover from '../src/Cover'
import Card from '../src/Card'
import Grid, { GridItem } from '../src/Grid'
import { NEWSLETTER_ID } from '../lib/publicEnv'
import { Loader } from '@project-r/styleguide'
import { graphql } from '@apollo/client/react/hoc'
import { gql, useQuery } from '@apollo/client'
import { createGetStaticProps } from '../lib/apollo/helpers'

const getNewsletterTeasers = gql`
query getNewsletterTeasers($first: Int) {
    documents(format: "${NEWSLETTER_ID}", first: $first) {
      nodes {
        id
        meta {
          title
          description
          publishDate
          prepublication
          path
          image
        }
      }
    }
  }
`

export const NewsletterTeasers = compose(graphql(getNewsletterTeasers))(
  ({ data: { loading, error, documents } }) => (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const newsletters = documents.nodes
        if (!newsletters.length) return null
        return (
          <Grid>
            {newsletters.map((newsletter, i) => (
              <GridItem key={i}>
                <Card {...newsletter.meta} />
              </GridItem>
            ))}
          </Grid>
        )
      }}
    />
  ),
)

const teasersToLoad = 1000

const News = () => {
  const { data, error, loading } = useQuery(getNewsletterTeasers, {
    variables: {
      first: teasersToLoad,
    },
  })

  const meta = {
    title: 'Aktuelles von Project R',
    description:
      'Stand der Arbeit, Stand des Irrtums beim Aufbau von Project R und der «Republik».',
    image: 'https://assets.project-r.construction/images/header_aktuelles.jpg',
  }

  return (
    <Layout
      meta={meta}
      cover={
        <Cover
          image={{
            src: 'https://assets.project-r.construction/images/header_aktuelles.jpg',
            alt: 'Balkon vom Hotel Rothaus mit gehisstem Project R Logo',
          }}
        >
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </Cover>
      }
    >
      <h2>Newsletter-Archiv</h2>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const newsletters = data?.documents.nodes
          if (!newsletters.length) return null
          return (
            <Grid>
              {newsletters.map((newsletter, i) => (
                <GridItem key={i}>
                  <Card {...newsletter.meta} />
                </GridItem>
              ))}
            </Grid>
          )
        }}
      />
    </Layout>
  )
}

export default News

export const getStaticProps = createGetStaticProps(async (client) => {
  await client.query({
    query: getNewsletterTeasers,
    variables: {
      first: teasersToLoad,
    },
  })

  return {
    props: {},
    revalidate: 60 * 5,
  }
})
