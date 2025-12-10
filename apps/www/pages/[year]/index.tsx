import { createGetServerSideProps } from '../../lib/apollo/helpers'

// Redirect /[year] to /[year]/1 (January)
export const getServerSideProps = createGetServerSideProps(
  async ({ ctx: { params } }) => {
    const { year } = params as { year: string }

    return {
      redirect: {
        destination: `/${year}/1`,
        permanent: false,
      },
    }
  },
)

// This component never renders due to redirect
export default function YearIndex() {
  return null
}
