import React from 'react'
import { css } from 'glamor'

const styles = {
  button: {
    'color': '#666',
    '&[data-active="true"]': {
      'color': '#000'
    }
  }
}
export default {
  Link: {
    Constants: {
      LINK: 'Link'
    },
    Inlines: {
      Link: ({ href, children }) =>
        <a href={href}>
          {children}
        </a>
    },
    UI: {
      Button: ({ active, ...props }) =>
        <span {...{...css(styles.button), ...props}}>Link</span>
    }
  }
}
