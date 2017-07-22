import { graphql, gql } from 'react-apollo'
import * as React from 'react'
import ErrorMessage from '../../ErrorMessage'
import { compose } from 'redux'

export interface Props {
  onUpload?: ({ csv }: any) => void
}

export interface State {
  feedback?: any
  error?: any
  csv?: string
}

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

const getInitialState = (props: Props): State => ({
  error: false
})

export default class UploadForm extends React.Component<
  Props,
  State
> {
  public fileInput: any = null

  constructor(props: any) {
    super(props)
    this.state = getInitialState(props)
  }

  public fileHandler = (e: any) => {
    this.setState(() => ({
      ...this.state,
      error: false
    }))
    const file = e.target.files[0]
    if (file.type.indexOf('csv') < 0) {
      this.setState(() => ({
        ...this.state,
        error: new Error('Das ist kein CSV.')
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
            ...this.state,
            error: err
          }))
        })
    }
  }

  public submitHandler = (e: any) => {
    e.preventDefault()
    if (this.props.onUpload) {
      this.props.onUpload({ csv: this.state.csv })
    }
  }

  public render() {
    const { error, feedback } = this.state

    return (
      <div>
        <form onSubmit={this.submitHandler}>
          {error && <ErrorMessage error={error} />}
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
            disabled={this.state.error || this.state.error}
          >
            Upload
          </button>
        </form>
      </div>
    )
  }
}
