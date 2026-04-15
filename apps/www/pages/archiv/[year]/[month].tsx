import { createGetServerSideProps } from '../../../lib/apollo/helpers'
import OverviewMonthPage from '../../../components/Overview/OverviewMonthPage'

export const getServerSideProps = createGetServerSideProps(
  async ({ ctx: { params } }) => {
    const { year: yearParam, month: monthParam } = params as {
      year: string
      month: string
    }

    const year = parseInt(yearParam, 10)
    const month = parseInt(monthParam, 10)

    // Validate year (2018-current year)
    const currentYear = new Date().getFullYear()
    const minYear = 2018
    const maxYear = currentYear

    if (isNaN(year) || year < minYear || year > maxYear) {
      return {
        notFound: true,
      }
    }

    // Validate month (1-12)
    if (isNaN(month) || month < 1 || month > 12) {
      return {
        notFound: true,
      }
    }

    // Return props including year, month, and me data
    return {
      props: {
        year,
        month,
      },
    }
  },
)

export default OverviewMonthPage
