import { createGetServerSideProps } from '../../../lib/apollo/helpers'

export const getServerSideProps = createGetServerSideProps(
  async ({ ctx: { params } }) => {
    const { year: yearParam } = params as {
      year: string
    }

    const year = parseInt(yearParam, 10)

    return {
      redirect: {
        destination: `/archiv/${year}/1`,
        permanent: false,
      },
    }
  },
)

export default function ArchivRedirect() {
  return null
}
