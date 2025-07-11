import { createGetServerSideProps } from 'lib/apollo/helpers'
import DialogLandingPage from '../../components/Dialog/Page'
import Meta from 'components/Frame/Meta'
import { Center, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import { CDN_FRONTEND_BASE_URL, PUBLIC_BASE_URL } from 'lib/constants'
import Frame from 'components/Frame'
import { gql } from '@apollo/client'

const styles = {
  container: css({
    paddingTop: 15,
    paddingBottom: 120,
    [mediaQueries.mUp]: {
      paddingTop: 25,
    },
  }),
}

const metaData = {
  title: 'Republik Dialog',
  description:
    'Die Republik ist nur so stark wie ihre Community. Teilen Sie Ihr Wissen und Ihre Perspektive.',
  image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
  url: `${PUBLIC_BASE_URL}/dialog`,
}

const DialogPage = () => {
  return (
    <Frame hasOverviewNav raw formatColor='primary' stickySecondaryNav={true}>
      <Meta data={metaData} />
      <Center>
        <div {...styles.container}>
          <DialogLandingPage />
        </div>
      </Center>
    </Frame>
  )
}

export default DialogPage

// ** Migration from old dialog routing with query params **
// Checks if there's an id in the search params
// if so, get discussion path and redirect to the dialog/[path] page
// if not, render the dialog root page (this is the new default route)

export const getServerSideProps = createGetServerSideProps(
  async ({ client, ctx, user }) => {
    const { id: discussionId, focus } = ctx?.query ?? {}

    if (!discussionId) {
      return {
        props: {},
      }
    }

    const {
      data: { discussion },
    } = await client.query({
      query: gql`
        query getDiscussionPath($discussionId: ID!) {
          discussion(id: $discussionId) {
            path
          }
        }
      `,
      variables: {
        discussionId,
      },
      errorPolicy: 'ignore',
    })

    if (discussion && discussion.path) {
      return {
        redirect: {
          destination: `/dialog${discussion.path}${
            focus ? `?focus=${focus}` : ''
          }`,
          permanent: true,
        },
      }
    }

    return {
      props: {},
    }
  },
)
