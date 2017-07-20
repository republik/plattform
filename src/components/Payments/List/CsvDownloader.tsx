import * as React from 'react'
import {
  gql,
  graphql
} from 'react-apollo'
import { css, StyleAttribute } from 'glamor'


const PaymentsCSVDownloader = (props: any) => {
  if (!process.browser || !props.data.paymentsCSV) {
    return <div>Loading</div>
  }
  const {
	  data: {paymentsCSV}
  } = props

  const blob = new Blob([paymentsCSV], {type: "text/csv"})
  const url = URL.createObjectURL(blob)

  return (
    <a download="export.csv" href={url}>Download CSV</a>
  )
}


const paymentsCSVQuery = gql`
  query {paymentsCSV}
`

export default graphql(paymentsCSVQuery)(PaymentsCSVDownloader)
