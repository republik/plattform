import { graphql, gql } from 'react-apollo'
import * as React from 'react'
import ErrorMessage from '../../ErrorMessage'

const readFile = (file: any) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.addEventListener('load', (event: any) => {
      const url = event.target.result
      // Strip out the information
      // about the mime type of the file and the encoding
      // at the beginning of the file (e.g. data:image/gif;base64,).
      const content = url.replace(/^(.+,)/, '')
      resolve({
        filename: file.name,
        content,
        url
      })
    })

    fileReader.addEventListener('error', (error: any) => {
      reject(error)
    })

    fileReader.readAsDataURL(file)
  })
}

class Upload extends React.Component<any, any> {
  public fileInput: any = null

  constructor(props: any) {
    super(props)
    this.state = {
      clientError: false,
      serverError: false,
      csv: null
    }
  }

  public fileHandler = (e: any) => {
    this.setState(() => ({
      clientError: false,
      serverError: false
    }))
    const file = e.target.files[0]
    if (file.type.indexOf('csv') < 0) {
      this.setState(() => ({
        clientError: new Error('Das ist kein CSV.')
      }))
    } else {
      readFile(file)
        .then(({ content, url, filename }) => {
          this.setState(() => ({
            csv: content
          }))
        })
        .catch((err: any) => {
          this.setState(() => ({
            clientError: err
          }))
        })
    }
  }

  public submitHandler = (e: any) => {
    e.preventDefault()
    this.props
      .uploadCSV({ csv: this.state.csv })
      .catch((err: any) => {
        this.setState(() => ({
          serverError: err
        }))
      })
  }

  public render() {
    const error = () => {
      if (this.state.clientError) {
        return (
          <ErrorMessage error={this.state.clientError} />
        )
      } else if (this.state.serverError) {
        return (
          <ErrorMessage error={this.state.serverError} />
        )
      }
    }

    return (
      <form onSubmit={this.submitHandler}>
        {error()}
        <input
          type="file"
          accept="application/csv"
          ref={ref => {
            this.fileInput = ref
          }}
          onChange={event => this.fileHandler(event)}
        />
        <button
          type="submit"
          disabled={this.state.clientError}
        >
          Upload
        </button>
      </form>
    )
  }
}

const mutation = gql`
  mutation importPostfinanceCSV($csv: String!) {
    importPostfinanceCSV(csv: $csv)
  }
`

export default graphql(mutation, {
  props: ({ mutate }) => ({
    uploadCSV: ({ csv }: any) => {
      if (mutate) {
        return mutate({
          variables: { csv }
        })
      }
    }
  })
})(Upload)
