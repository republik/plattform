import React, { Component } from 'react'
import ErrorMessage from '../../ErrorMessage'

const readFile = file => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.addEventListener('load', event => {
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

    fileReader.addEventListener(
      'error',
      error => {
        reject(error)
      }
    )

    fileReader.readAsDataURL(file)
  })
}

const getInitialState = () => ({
  error: false
})

export default class UploadForm extends Component {
  fileInput = null

  constructor(props) {
    super(props)
    this.state = getInitialState(props)
  }

  fileHandler = e => {
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
        .then(({ content }) => {
          this.setState(() => ({
            csv: content
          }))
        })
        .catch(err => {
          this.setState(() => ({
            ...this.state,
            error: err
          }))
        })
    }
  }

  submitHandler = e => {
    e.preventDefault()
    if (this.props.onUpload) {
      this.props.onUpload({ csv: this.state.csv })
    }
  }

  render() {
    const { error } = this.state

    return (
      <div>
        <form onSubmit={this.submitHandler}>
          {error && (
            <ErrorMessage error={error} />
          )}
          <input
            type="file"
            accept="application/csv"
            ref={ref => {
              this.fileInput = ref
            }}
            onChange={event =>
              this.fileHandler(event)
            }
          />
          <button
            type="submit"
            disabled={
              this.state.error || this.state.error
            }
          >
            Upload
          </button>
        </form>
      </div>
    )
  }
}
