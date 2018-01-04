import * as React from 'react'
import { ApolloClient, gql, withApollo } from 'react-apollo'
import { css, StyleAttribute } from 'glamor'
import ErrorMessage from '../../ErrorMessage'
import { A, colors } from '@project-r/styleguide'

interface Company {
  name: string
  label: string
}

const companies : [Company] = [
  { label: "Project R", name: "PROJECT_R" },
  { label: "Republik AG", name: "REPUBLIK" }
]

const PaymentsCSVDownloader = (props: any) => {
  if (!process.browser || !props.data.paymentsCSV) {
    return <div>Loading</div>
  }
  const { data: { paymentsCSV } } = props

  const blob = new Blob([paymentsCSV], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  return (
    <a download="export.csv" href={url}>
      Download CSV
    </a>
  )
}

const link = css({
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary
  },
  ':hover': {
    color: colors.secondary
  }
})

const query = gql`
  query paymentsCSV($companyName: String!) {
    paymentsCSV(companyName: $companyName)
  }
`

class CSVDownloader extends React.Component<
  { client: ApolloClient },
  any
> {
  constructor(props: { client: ApolloClient }) {
    super(props)
    this.state = {
      csv: null,
      loading: false,
      error: null,
      companyName: companies[0].name
    }
  }

  public setCompany = (event: { target: { value: string } }) => {
    const companyName = event.target.value
    this.setState(() => ({
      companyName: companyName
    }))
  }

  public query = () => {
    this.setState(() => ({
      loading: true
    }))

    const { companyName } = this.state;
    this.props.client
      .query({
        query,
        variables: { companyName },
        fetchPolicy: 'network-only'
      })
      .then(({ data }: any) => {
        this.setState(() => ({
          loading: false,
          csv: data.paymentsCSV
        }))
      })
      .catch((error: any) => {
        this.setState(() => ({
          error
        }))
      })
  }

  public reset = () => {
    setTimeout( () => {
      this.setState(() => ({
        csv: null
      }))
    }, 1000)
  }

  public render() {
    if (this.state.error) {
      return <ErrorMessage error={this.state.error} />
    }
    if (!this.state.csv) {
      if (this.state.loading) {
        return <p>Loading ...</p>
      } else {
        return (
          <div>
            <select
              name="companyName"
              value={this.state.companyName}
              onChange={this.setCompany}
              >
              {companies.map(({ name, label }) => (
                <option key={name} value={name}>{label}</option>
              ))}
            </select>
            <button
              style={{ cursor: 'pointer' }}
              className={`${link}`}
              onClick={this.query}
            >
              Get CSV for selected legal entity
            </button>
          </div>
        )
      }
    } else {
      const blob = new Blob([this.state.csv], {
        type: 'text/csv'
      })
      const url = URL.createObjectURL(blob)

      return (
        <a
          className={`${link}`}
          download="export.csv"
          href={url}
          onClick={this.reset}
        >
          Download CSV
        </a>
      )
    }
  }
}

export default withApollo(CSVDownloader)
