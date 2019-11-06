import React, { Component } from 'react'
import { css } from 'glamor'
import { Label, Button } from '@project-r/styleguide'

const styles = {
  label: css({
    display: 'block',
    marginBottom: 5
  }),
  input: css({
    display: 'none'
  })
}

const readFiles = onChange => e => {
  const files = [...e.target.files]

  if (files.length < 1) {
    return
  }

  const htmlFile = files.find(file => file.type === 'text/html')
  const imageFiles = files.filter(file => file.type.split('/')[0] === 'image')

  if (!htmlFile) {
    return
  }

  const code = new Promise(resolve => {
    const reader = new window.FileReader()
    reader.addEventListener(
      'load',
      () => resolve(reader.result)
    )
    reader.addEventListener(
      'error',
      e => window.alert(e)
    )
    reader.readAsText(htmlFile)
  })

  const images = Promise.all(
    imageFiles.map(file => new Promise(resolve => {
      const reader = new window.FileReader()

      reader.addEventListener(
        'load',
        () => {
          resolve({
            url: reader.result,
            ref: file.name
          })
        }
      )
      reader.addEventListener(
        'error',
        e => window.alert(e)
      )
      reader.readAsDataURL(file)
    }))
  )

  Promise.all([
    code,
    images
  ]).then(([code, images]) => onChange({
    code,
    images
  }))
}

class ImageInput extends Component {
  constructor (...args) {
    super(...args)
    this.setInput = ref => {
      this.input = ref
    }
  }
  render () {
    const { onChange } = this.props
    return (
      <label>
        <Label {...styles.label}>
          Dateien (ai2html-output)
        </Label>
        <Button onClick={() => {
          this.input.click()
        }}>hochladen</Button>
        <input
          ref={this.setInput}
          type='file'
          accept='text/html,image/*'
          multiple
          {...styles.input}
          onChange={readFiles(onChange)}
        />
      </label>
    )
  }
}

export default ImageInput
