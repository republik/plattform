import { gql } from '@apollo/client'
import Profile from '../../components/Profile/Page'
import { createGetServerSideProps } from '../../lib/apollo/helpers'

export default Profile

const getPublicUserSlug = gql`
  query getPublicUserSlug($slug: String!) {
    user(slug: $slug) {
      id
      username
      slug
    }
  }
`

export const getServerSideProps = createGetServerSideProps(
  async ({ client, ctx, user: me }) => {
    const slug = ctx.params?.slug

    // Redirect to own profile
    if (slug === 'me') {
      return {
        redirect: {
          destination: `/~${me.slug}`,
          permanent: false,
        },
      }
    }

    const {
      data: { user },
    } = await client.query({
      query: getPublicUserSlug,
      variables: { slug },
    })

    if (!user) {
      return {
        notFound: true,
      }
    }

    // Redirect id to username if available
    // (user.slug is either username or id, so we check for both to avoid infinite redirects)
    if (user.username && user.id === slug) {
      return {
        redirect: { destination: `/~${user.slug}`, permanent: false },
      }
    }

    return { props: { user } }
  },
)
