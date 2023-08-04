import { createGetServerSideProps } from '../../lib/apollo/helpers'

type Props = {
  events: string[]
}

const Events = ({ events }: Props) => {
  return <div>Hello {events.join(',')}</div>
}

export const getServerSideProps = createGetServerSideProps<Props>(
  async ({ ctx, user }) => {
    if (!user?.roles.includes('editor')) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        events: ['one', 'two', 'three'],
      },
    }
  },
)

export default Events
