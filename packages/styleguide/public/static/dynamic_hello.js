define(['react', 'glamor'], function(React, glamor) {
  'use strict'

  React = React && React.hasOwnProperty('default') ? React['default'] : React

  return props =>
    React.createElement(
      'div',
      glamor.css({
        backgroundColor: 'purple',
        color: 'white'
      }),
      props.text || 'other side'
    )
})
