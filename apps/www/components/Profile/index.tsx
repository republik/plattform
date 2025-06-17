import { useQuery } from '@apollo/client'
import { css } from 'glamor'

import { useTranslation } from '../../lib/withT'

import Frame from '../Frame'

import { PUBLIC_BASE_URL } from '../../lib/constants'

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

const Profile = ({ slug }: { slug: string }) => {
  const { t } = useTranslation()

  // Only run query after cache is initialized, and use cache-only to prevent network request
  const { data, fetchMore } = useQuery(getPublicUser, {
    variables: {
      slug,
      firstDocuments: 10,
      firstComments: 10,
    },
  })

  const user = data?.user

  if (!user) {
    // This should not happen, as the page should have returned a 404 already
    return null
  }

  // Create structured person data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateModified: user.updatedAt,
    mainEntity: {
      '@type': 'Person',
      name: user.name,
      identifier: user.slug,
      description: user.biography || user.statement || '',
      image: user.portrait,
      interactionStatistic: [
        ...(user.documents?.totalCount
          ? [
              {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/WriteAction',
                userInteractionCount: user.documents.totalCount,
              },
            ]
          : []),
        ...(user.comments?.totalCount
          ? [
              {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/CommentAction',
                userInteractionCount: user.comments.totalCount,
              },
            ]
          : []),
      ],
    },
  }

  const metaData = {
    url: `${PUBLIC_BASE_URL}/~${user.slug}`,
    image: user.portrait
      ? screenshotUrl({
          url: `${PUBLIC_BASE_URL}/community?share=${user.id}`,
          width: 1200,
          height: 628,
          version: user.updatedAt,
        })
      : '',
    pageTitle: t('pages/profile/pageTitle', { name: user.name }),
    title: t('pages/profile/title', { name: user.name }),
    jsonLds: [structuredData],
  }

  return (
    <Frame meta={metaData} raw>
      <ProfilePage data={{ user }} fetchMore={fetchMore} />
    </Frame>
  )
}

export default Profile
