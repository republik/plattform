import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { css } from 'glamor'
import ErrorMessage from '../../ErrorMessage'
import { colors } from '@project-r/styleguide'

const companies = [
  { label: 'Project R', name: 'PROJECT_R' },
  { label: 'Republik AG', name: 'REPUBLIK' }
]

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

class CSVDownloader extends Component {
  constructor(props: { client: ApolloClient }) {
    super(props)
    this.state = {
      csv: null,
      loading: false,
      error: null,
      companyName: companies[0].name
    }
  }

  setCompany = (event: { target: { value: string } }) => {
    const companyName = event.target.value
    this.setState(() => ({
      companyName: companyName
    }))
  }

  query = () => {
    this.setState(() => ({
      loading: true
    }))

    const { companyName } = this.state
    this.props.client
      .query({
        query,
        variables: { companyName },
        fetchPolicy: 'network-only'
      })
      .then(({ data }) => {
        this.setState(() => ({
          loading: false,
          csv: data.paymentsCSV
        }))
      })
      .catch(error => {
        this.setState(() => ({
          error
        }))
      })
  }

  reset = () => {
    setTimeout(() => {
      this.setState(() => ({
        csv: null
      }))
    }, 1000)
  }

  render() {
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
                <option key={name} value={name}>
                  {label}
                </option>
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
