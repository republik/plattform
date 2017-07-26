import React, { Component } from 'react'
import { Raw, resetKeyGenerator } from 'slate'

import App from '../lib/App'
import Editor from '../lib/editor/components/Editor'

const getInitialState = () => {
  resetKeyGenerator()
  return {
    state: Raw.deserialize(
      {
        nodes: [
          {
            kind: 'block',
            type: 'document',
            nodes: [
              {
                kind: 'block',
                type: 'h1',
                nodes: [
                  {
                    kind: 'text',
                    text: 'A fixed label.'
                  }
                ]
              },
              {
                kind: 'block',
                type: 'p',
                nodes: [
                  {
                    kind: 'text',
                    text:
                      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vestibulum dui eget tellus fermentum, eu lobortis libero lacinia. Maecenas commodo lacus dignissim, aliquet risus non, scelerisque dui. Aliquam at massa rutrum ante laoreet pharetra non a nulla. Praesent imperdiet egestas dapibus. Nunc quis lorem vehicula, pharetra nibh quis, dignissim felis. Fusce in justo pharetra, lacinia lorem in, dignissim sem. Phasellus lacinia turpis massa. Etiam eu condimentum diam.'
                  }
                ]
              },
              {
                kind: 'block',
                type: 'p',
                nodes: [
                  {
                    kind: 'text',
                    text:
                      'Nullam et metus mauris. Quisque scelerisque massa commodo, dapibus tortor in, condimentum dui. Integer pellentesque, dolor quis condimentum bibendum, lacus neque rutrum orci, vel egestas quam augue ac est. Mauris auctor fringilla neque. Maecenas varius pulvinar mattis. Donec aliquet odio quis nibh rhoncus, nec pretium odio vestibulum. Donec dictum ut lectus non posuere. Integer orci eros, scelerisque ac urna a, rutrum tincidunt lectus. Vestibulum volutpat enim non purus tincidunt dignissim. Praesent tincidunt magna eget augue ultrices mollis. Morbi sodales suscipit dui tincidunt malesuada. Integer ac mattis purus. Nulla ornare porta nisi sed fermentum. Praesent ut porttitor massa. Maecenas vestibulum felis purus, et bibendum lorem tempus sit amet. In commodo, ex sit amet posuere porttitor, metus turpis aliquet augue, eu feugiat leo dolor ut lorem.'
                  }
                ]
              },
              {
                kind: 'block',
                type: 'p',
                nodes: [
                  {
                    kind: 'text',
                    text:
                      'Duis viverra magna sed dui fringilla posuere ac a quam. Aenean rhoncus felis sapien, et maximus nunc pellentesque et. Vestibulum commodo leo a ex vehicula auctor. Proin placerat urna vel justo laoreet sodales. Integer ullamcorper sem magna, vitae hendrerit dui imperdiet nec. Pellentesque quis turpis ac magna bibendum blandit et eget leo. Quisque convallis luctus libero, a fringilla massa consectetur eget. Donec eget lectus justo. Nam bibendum massa congue sem laoreet, sit amet pretium augue iaculis. Donec luctus ante sit amet semper interdum. Nunc mauris risus, vestibulum mollis massa ut, interdum scelerisque ex. Morbi consectetur justo velit, in lobortis tellus consequat nec.'
                  }
                ]
              }
            ]
          }
        ]
      },
      { terse: true }
    )
  }
}

export default class Index extends Component {
  constructor(...args) {
    super(...args)
    this.state = getInitialState()
  }

  commitHandler(state) {
    console.log(state.toJS())
  }

  render() {
    return (
      <App>
        <Editor
          state={this.state.state}
          onCommit={this.commitHandler.bind(this)}
        />
      </App>
    )
  }
}
