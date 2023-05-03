import { Fragment, useRef } from 'react'
import { withRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import withT from '../../../lib/withT'
import withMe from '../../../lib/apollo/withMe'
import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../../../lib/constants'

import { useDebounce } from '@project-r/styleguide'

import Frame from '../../../components/Frame'
import Meta from '../../../components/Frame/Meta'
import Container from '../../../components/Card/Container'
import Group from '../../../components/Card/Group'
import Loader from '../../../components/Loader'
import StatusError from '../../../components/StatusError'
import { cardFragment } from '../../../components/Card/fragments'
import { useCardPreferences } from '../../../components/Card/Preferences'
import medianSmartspiders from '../../../components/Card/medianSmartspiders'
import { withDefaultSSR } from '../../../lib/apollo/helpers'

const query = gql`
  query getCardGroup(
    $slug: String!
    $after: String
    $top: [ID!]
    $mustHave: [CardFiltersMustHaveInput!]
    $smartspider: [Float]
    $elected: Boolean
  ) {
    cardGroup(slug: $slug) {
      id
      name
      slug
      discussion {
        id
        title
      }
      all: cards(first: 0) {
        totalCount
      }
      cards(
        first: 50
        after: $after
        focus: $top
        filters: { mustHave: $mustHave, elected: $elected }
        sort: { smartspider: $smartspider }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          ...Card
        }
      }
    }
  }

  ${cardFragment}
`

const subscribedByMeQuery = gql`
  query getSubscribedCardGroup($slug: String!) {
    cardGroup(slug: $slug) {
      id
      cards(first: 5000, filters: { subscribedByMe: true }) {
        totalCount
        nodes {
          id
          ...Card
          user {
            id
            subscribedByMe {
              id
              createdAt
            }
          }
        }
      }
    }
  }

  ${cardFragment}
`

const specialQuery = gql`
  query getSpecialCards(
    $after: String
    $top: [ID!]
    $mustHave: [CardFiltersMustHaveInput!]
    $smartspider: [Float]
    $elected: Boolean
  ) {
    all: cards(first: 0, filters: { elected: $elected }) {
      totalCount
    }
    cards(
      first: 50
      after: $after
      focus: $top
      filters: { mustHave: $mustHave, elected: $elected }
      sort: { smartspider: $smartspider }
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        ...Card
        group {
          id
          name
          slug
          discussion {
            id
          }
        }
      }
    }
  }

  ${cardFragment}
`

const subscribedByMeSpecialQuery = gql`
  query getSubscribedSpecialCards($elected: Boolean) {
    cards(first: 5000, filters: { subscribedByMe: true, elected: $elected }) {
      totalCount
      nodes {
        id
        ...Card
        user {
          id
          subscribedByMe {
            id
            createdAt
          }
        }
      }
    }
  }

  ${cardFragment}
`

const specialGroups = {
  bundesversammlung: {
    name: 'Neue Bundesversammlung',
    slug: 'bundesversammlung',
    forcedVariables: { elected: true },
  },
}

const Inner = ({
  data,
  fetchMore,
  subscribedByMeData,
  t,
  serverContext,
  variables,
  mySmartspider,
  medianSmartspider,
  query,
}) => {
  const loading =
    (subscribedByMeData && subscribedByMeData.loading) ||
    (data.loading && (!data.cardGroup || !data.cardGroup.cards))
  const Wrapper = loading
    ? ({ children }) => (
        <Container style={{ minHeight: 400 }}>{children}</Container>
      )
    : Fragment
  const error = data.error || (subscribedByMeData && subscribedByMeData.error)

  if (
    query.suffix &&
    (query.suffix.length > 1 ||
      !['diskussion', 'liste'].includes(query.suffix[0]))
  ) {
    return <StatusError statusCode={404} serverContext={serverContext} />
  }

  return (
    <Wrapper>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          if (!data.cardGroup) {
            return (
              <StatusError statusCode={404} serverContext={serverContext} />
            )
          }
          const meta = !(query.suffix?.[0] === 'diskussion' && query.focus) && (
            <Meta
              data={{
                title: t.first(
                  [
                    `pages/cardGroup/title/${data.cardGroup.slug}`,
                    'pages/cardGroup/title',
                  ],
                  {
                    name: data.cardGroup.name,
                  },
                ),
                description: t.first(
                  [
                    `pages/cardGroup/description/${data.cardGroup.slug}`,
                    'pages/cardGroup/description',
                  ],
                  {
                    name: data.cardGroup.name,
                    count: data.cardGroup.cards.totalCount,
                  },
                ),
                url: `${PUBLIC_BASE_URL}/wahltindaer/${data.cardGroup.slug}`,
                image: `${CDN_FRONTEND_BASE_URL}/static/social-media/republik-wahltindaer-09.png`,
              }}
            />
          )
          return (
            <>
              {meta}
              <Group
                group={data.cardGroup}
                subscribedByMeCards={
                  subscribedByMeData && subscribedByMeData.cards
                }
                variables={variables}
                mySmartspider={mySmartspider}
                medianSmartspider={medianSmartspider}
                fetchMore={fetchMore}
              />
            </>
          )
        }}
      />
    </Wrapper>
  )
}

const Query = compose(
  withT,
  graphql(subscribedByMeQuery, {
    skip: (props) => !props.me || specialGroups[props.variables.slug],
    options: ({ variables: { slug } }) => ({
      fetchPolicy: 'network-only',
      ssr: false,
      variables: {
        slug,
      },
    }),
    props: ({ data }) => ({
      subscribedByMeData: {
        loading: data.loading,
        error: data.error,
        cards: data.cardGroup && data.cardGroup.cards.nodes,
      },
    }),
  }),
  graphql(query, {
    skip: (props) => specialGroups[props.variables.slug],
    options: ({ variables }) => ({
      ssr: false,
      variables,
    }),
    props: ({ data }) => ({
      data,
      fetchMore: ({ endCursor }) =>
        data.fetchMore({
          variables: {
            after: endCursor,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            return {
              ...previousResult,
              ...fetchMoreResult,
              cardGroup: {
                ...previousResult.cardGroup,
                ...fetchMoreResult.cardGroup,
                cards: {
                  ...previousResult.cardGroup.cards,
                  ...fetchMoreResult.cardGroup.cards,
                  nodes: [
                    ...previousResult.cardGroup.cards.nodes,
                    ...fetchMoreResult.cardGroup.cards.nodes,
                  ].filter(
                    (value, index, all) =>
                      index === all.findIndex((other) => value.id === other.id),
                  ),
                },
              },
            }
          },
        }),
    }),
  }),
  graphql(subscribedByMeSpecialQuery, {
    skip: (props) => !props.me || !specialGroups[props.variables.slug],
    options: ({ variables: { slug } }) => ({
      fetchPolicy: 'network-only',
      ssr: false,
      variables: specialGroups[slug].forcedVariables,
    }),
    props: ({ data }) => ({
      subscribedByMeData: {
        loading: data.loading,
        error: data.error,
        cards: data.cards && data.cards.nodes,
      },
    }),
  }),
  graphql(specialQuery, {
    skip: (props) => !specialGroups[props.variables.slug],
    options: ({ variables: { slug, ...variables } }) => ({
      ssr: false,
      variables: {
        ...variables,
        ...specialGroups[slug].forcedVariables,
      },
    }),
    props: ({
      data,
      ownProps: {
        variables: { slug },
      },
    }) => ({
      data: {
        ...data,
        cardGroup: {
          special: true,
          ...specialGroups[slug],
          cards: data.cards,
          all: data.all,
        },
      },
      fetchMore: ({ endCursor }) =>
        data.fetchMore({
          variables: {
            after: endCursor,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            return {
              ...previousResult,
              ...fetchMoreResult,
              cards: {
                ...previousResult.cards,
                ...fetchMoreResult.cards,
                nodes: [
                  ...previousResult.cards.nodes,
                  ...fetchMoreResult.cards.nodes,
                ].filter(
                  (value, index, all) =>
                    index === all.findIndex((other) => value.id === other.id),
                ),
              },
            }
          },
        }),
    }),
  }),
)(Inner)

const Page = ({
  serverContext,
  router: {
    query,
    query: { group, top, stale, party },
  },
  me,
}) => {
  const [preferences] = useCardPreferences({})
  const [slowPreferences] = useDebounce(preferences, 500)
  const meRef = useRef(me)
  if (!stale) {
    meRef.current = me
  }
  const topRef = useRef(top)
  if (top) {
    topRef.current = top
  }

  const medianSmartspider =
    party && medianSmartspiders.find((m) => m.value === party)

  return (
    <Frame footer={false} pullable={false} raw pageColorSchemeKey='light'>
      <Query
        me={meRef.current}
        serverContext={serverContext}
        medianSmartspider={medianSmartspider}
        mySmartspider={slowPreferences.mySmartspider}
        query={query}
        variables={{
          slug: group,
          top: topRef.current ? [topRef.current] : undefined,
          elected: slowPreferences.elected ? true : undefined,
          mustHave: [
            slowPreferences.portrait && 'portrait',
            slowPreferences.smartspider && 'smartspider',
            slowPreferences.statement && 'statement',
            slowPreferences.financing && 'financing',
          ].filter(Boolean),
          smartspider: medianSmartspider
            ? medianSmartspider.smartspider
            : slowPreferences.mySmartspider && slowPreferences.mySmartspiderSort
            ? slowPreferences.mySmartspider
            : undefined,
        }}
      />
    </Frame>
  )
}

export default withDefaultSSR(compose(withMe, withRouter)(Page))
