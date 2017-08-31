import React, { Component } from 'react'
import { resetKeyGenerator } from 'slate'
import App from '../lib/App'
import Editor, {serializer} from '../components/editor/NewsletterEditor'

const getInitialState = () => {
  resetKeyGenerator()
  return {
    state: serializer.deserialize(`
Lorem sipsum dolor sit amet, consectetur adipiscing elit. Proin vestibulum dui eget tellus fermentum, eu lobortis libero lacinia. Maecenas commodo lacus dignissim, aliquet risus non, scelerisque dui. Aliquam at massa rutrum ante laoreet pharetra non a nulla. Praesent imperdiet egestas dapibus. Nunc quis lorem vehicula, pharetra nibh quis, dignissim felis. Fusce in justo pharetra, lacinia lorem in, dignissim sem. Phasellus lacinia turpis massa. Etiam eu condimentum diam.

![](/static/example.jpg)

Nullam et metus mauris. Quisque scelerisque massa commodo, dapibus tortor in, condimentum dui. Integer pellentesque, dolor quis condimentum bibendum, lacus neque rutrum orci, vel egestas quam augue ac est. Mauris auctor fringilla neque. Maecenas varius pulvinar mattis. Donec aliquet odio quis nibh rhoncus, nec pretium odio vestibulum. Donec dictum ut lectus non posuere. Integer orci eros, scelerisque ac urna a, rutrum tincidunt lectus. Vestibulum volutpat enim non purus tincidunt dignissim. Praesent tincidunt magna eget augue ultrices mollis. Morbi sodales suscipit dui tincidunt malesuada. Integer ac mattis purus. Nulla ornare porta nisi sed fermentum. Praesent ut porttitor massa. Maecenas vestibulum felis purus, et bibendum lorem tempus sit amet. In commodo, ex sit amet posuere porttitor, metus turpis aliquet augue, eu feugiat leo dolor ut lorem.`)
  }
}

export default class Index extends Component {
  constructor (...args) {
    super(...args)
    this.state = getInitialState()

    this.onDocumentChange = (document, state) => {
      try {
        // console.log(serializer.serialize(state))
      } catch (e) {
        // console.error(e)
      }
    }
  }

  render () {
    return (
      <App>
        <Editor
          state={this.state.state}
          onChange={state => this.setState({state})}
          onDocumentChange={this.onDocumentChange}
        />
      </App>
    )
  }
}
