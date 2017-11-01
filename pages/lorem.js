import React, { Component } from 'react'
import { resetKeyGenerator } from 'slate'
import Frame from '../components/Frame'
import Editor from '../components/editor'
import withData from '../lib/apollo/withData'

import newsletterSchema from '../components/Templates/Newsletter'

const getInitialState = (editor) => {
  resetKeyGenerator()
  return {
    value: editor.serializer.deserialize(`
Lorem sipsum dolor sit amet, consectetur adipiscing elit. Proin vestibulum dui eget tellus fermentum, eu lobortis libero lacinia. Maecenas commodo lacus dignissim, aliquet risus non, scelerisque dui. Aliquam at massa rutrum ante laoreet pharetra non a nulla. Praesent imperdiet egestas dapibus. Nunc quis lorem vehicula, pharetra nibh quis, dignissim felis. Fusce in justo pharetra, lacinia lorem in, dignissim sem. Phasellus lacinia turpis massa. Etiam eu condimentum diam.

![](/static/example.jpg)

Nullam et metus mauris. Quisque scelerisque massa commodo, dapibus tortor in, condimentum dui. Integer pellentesque, dolor quis condimentum bibendum, lacus neque rutrum orci, vel egestas quam augue ac est. Mauris auctor fringilla neque. Maecenas varius pulvinar mattis. Donec aliquet odio quis nibh rhoncus, nec pretium odio vestibulum. Donec dictum ut lectus non posuere. Integer orci eros, scelerisque ac urna a, rutrum tincidunt lectus. Vestibulum volutpat enim non purus tincidunt dignissim. Praesent tincidunt magna eget augue ultrices mollis. Morbi sodales suscipit dui tincidunt malesuada. Integer ac mattis purus. Nulla ornare porta nisi sed fermentum. Praesent ut porttitor massa. Maecenas vestibulum felis purus, et bibendum lorem tempus sit amet. In commodo, ex sit amet posuere porttitor, metus turpis aliquet augue, eu feugiat leo dolor ut lorem.`)
  }
}

class Index extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
    this.onDocumentChange = (document, change) => {
      try {
        // console.log(serializer.serialize(change.state))
      } catch (e) {
        // console.error(e)
      }
    }
    this.editorRef = ref => {
      this.editor = ref
    }
  }
  componentDidMount () {
    this.setState(getInitialState(this.editor))
  }
  render () {
    const { url } = this.props
    return (
      <Frame url={url} raw>
        <Editor
          ref={this.editorRef}
          schema={newsletterSchema}
          value={this.state.value}
          onChange={({value}) => {
            this.setState({value})
          }}
          onDocumentChange={this.onDocumentChange}
        />
      </Frame>
    )
  }
}

export default withData(Index)
