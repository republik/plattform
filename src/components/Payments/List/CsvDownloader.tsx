import * as React from 'react'
import { ApolloClient, gql, withApollo } from 'react-apollo'
import { css, StyleAttribute } from 'glamor'

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

const query = gql`
  query {
    paymentsCSV
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
      loading: false
    }
  }

  public query = () => {
    this.setState(() => ({
      loading: true
    }))

    this.props.client
      .query({
        query
      })
      .then(({ data }: any) => {
        this.setState(() => ({
          loading: false,
          csv: data.paymentsCSV
        }))
      })
  }

  public render() {
    if (!this.state.csv) {
      if (this.state.loading) {
        return <p>Loading ...</p>
      } else {
        return <a onClick={this.query}>Get CSV</a>
      }
    } else {
      const blob = new Blob([this.state.csv], {
        type: 'text/csv'
      })
      const url = URL.createObjectURL(blob)

      return (
        <a download="export.csv" href={url}>
          Download CSV
        </a>
      )
    }
  }
}

export default withApollo(CSVDownloader)
