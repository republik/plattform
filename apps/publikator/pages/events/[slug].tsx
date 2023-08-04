import { createGetServerSideProps } from '../../lib/apollo/helpers'

type Props = {
  slug: string
}

const Event = ({ slug }) => {
  return <div>1 Event with slug {slug}</div>
}

export const getServerSideProps = createGetServerSideProps<Props>(
  async ({ ctx, user }) => {
    if (!user?.roles.includes('editor')) {
      return {
        notFound: true,
      }
    }

    const eventSlug = ctx.params.slug as string | undefined

    if (!eventSlug) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        slug: eventSlug,
      },
    }
  },
)

export default Event
