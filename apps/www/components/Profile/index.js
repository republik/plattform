import { useQuery } from '@apollo/client'
import { css } from 'glamor'

import { useTranslation } from '../../lib/withT'

import Loader from '../Loader'
import Frame from '../Frame'

import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'

import { useMe } from '../../lib/context/MeContext'
import getPublicUser from './graphql/getPublicUser'
import { useRouter } from 'next/router'

import ProfileView from './ProfileView'
import EditProfile from './EditProfile'
import {
  mediaQueries,
  Container,
} from '@project-r/styleguide'


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

const Profile = ({ user: foundUser }) => {
  const { t } = useTranslation()

  const { loading, error, data, fetchMore } = useQuery(getPublicUser, {
    variables: {
      slug: foundUser.slug,
      firstDocuments: 10,
      firstComments: 10,
    },
  })
  const user = data?.user

  const metaData = {
    url: user ? `${PUBLIC_BASE_URL}/~${user.slug}` : undefined,
    image:
      user && user.portrait
        ? `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=628&updatedAt=${encodeURIComponent(
            user.updatedAt,
          )}b2&url=${encodeURIComponent(
            `${PUBLIC_BASE_URL}/community?share=${user.id}`,
          )}`
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
          return <ProfilePage t={t} data={data} fetchMore={fetchMore} />
        }}
      />
    </Frame>
  )
}

export default Profile
