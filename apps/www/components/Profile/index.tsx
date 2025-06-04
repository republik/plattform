import { useQuery, useApolloClient } from '@apollo/client'
import { css } from 'glamor'
import { useEffect, useState } from 'react'

import { useTranslation } from '../../lib/withT'

import Frame from '../Frame'

import { PUBLIC_BASE_URL } from '../../lib/constants'

import type { User } from '#graphql/republik-api/__generated__/gql/graphql'
import { useRouter } from 'next/router'
import { useMe } from '../../lib/context/MeContext'
import getPublicUser from './graphql/getPublicUser'

import { screenshotUrl } from '@app/lib/util/screenshot-api'
import { Container, mediaQueries } from '@project-r/styleguide'
import EditProfile from './EditProfile'
import ProfileView from './ProfileView'

const styles = {
  container: css({
    maxWidth: 840,
    margin: '32px auto',
    [mediaQueries.mUp]: {
      margin: '96px auto',
    },
  }),
}

const ProfilePage = ({ data, fetchMore }) => {
  const router = useRouter()
  const { me } = useMe()
  const {
    query: { edit },
  } = router

  return (
    <Container {...styles.container}>
      {edit && me.id == data.user.id ? (
        <EditProfile data={data} />
      ) : (
        <ProfileView data={data} fetchMore={fetchMore} />
      )}
    </Container>
  )
}

const Profile = ({ publicUser }: { publicUser: User }) => {
  const { t } = useTranslation()
  const client = useApolloClient()
  const [cacheInitialized, setCacheInitialized] = useState(false)

  // Initialize Apollo cache with server-side data
  useEffect(() => {
    client.writeQuery({
      query: getPublicUser,
      variables: {
        slug: publicUser.slug,
        firstDocuments: 10,
        firstComments: 10,
      },
      data: {
        user: publicUser,
      },
    })
    setCacheInitialized(true)
  }, [client, publicUser])

  // Only run query after cache is initialized, and use cache-only to prevent network request
  const { data, fetchMore } = useQuery(getPublicUser, {
    variables: {
      slug: publicUser.slug,
      firstDocuments: 10,
      firstComments: 10,
    },
    skip: !cacheInitialized, // Wait until cache is initialized
    fetchPolicy: cacheInitialized ? 'cache-first' : 'cache-only', // Prefer cache when available
  })

  const user = data?.user || publicUser

  // Create structured person data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "dateModified": user.updatedAt,
    "mainEntity": {
      "@type": "Person",
      "name": user.name,
      "identifier": user.slug,
      "description": user.biography || user.statement || '',
      "image": user.portrait,
      "interactionStatistic": [
        ...(user.documents?.totalCount ? [{
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WriteAction",
          "userInteractionCount": user.documents.totalCount
        }] : []),
        ...(user.comments?.totalCount ? [{
          "@type": "InteractionCounter", 
          "interactionType": "https://schema.org/CommentAction",
          "userInteractionCount": user.comments.totalCount
        }] : [])
      ]
    }
  }

  const metaData = {
    url: user ? `${PUBLIC_BASE_URL}/~${user.slug}` : undefined,
    image:
      user && user.portrait
        ? screenshotUrl({
            url: `${PUBLIC_BASE_URL}/community?share=${user.id}`,
            width: 1200,
            height: 628,
            version: user.updatedAt,
          })
        : '',
    pageTitle: user
      ? t('pages/profile/pageTitle', { name: user.name })
      : t('pages/profile/empty/pageTitle'),
    title: user
      ? t('pages/profile/title', { name: user.name })
      : t('pages/profile/empty/title'),
    jsonLds: [structuredData],
  }

  return (
    <Frame meta={metaData} raw>
      <ProfilePage data={{ user }} fetchMore={fetchMore} />
    </Frame>
  )
}

export default Profile
