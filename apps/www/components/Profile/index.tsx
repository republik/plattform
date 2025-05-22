import { useQuery } from '@apollo/client'
import { css } from 'glamor'

import { useTranslation } from '../../lib/withT'

import Frame from '../Frame'
import Loader from '../Loader'

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

const Profile = ({ user: foundUser }: { user: User }) => {
  const { t } = useTranslation()

  const { loading, error, data, fetchMore } = useQuery(getPublicUser, {
    variables: {
      slug: foundUser.slug,
      firstDocuments: 10,
      firstComments: 10,
    },
  })
  const user: User = data?.user

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
  }

  return (
    <Frame meta={metaData} raw>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          return <ProfilePage data={data} fetchMore={fetchMore} />
        }}
      />
    </Frame>
  )
}

export default Profile
