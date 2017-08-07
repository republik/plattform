import React from 'react'
import { colors, A } from '@project-r/styleguide'
import { css } from 'glamor'
import LinkIcon from 'react-icons/lib/fa/chain'

const styles = {
  button: {
    textAlign: 'center',
    display: 'inline-block',
    width: '30px',
    cursor: 'pointer',
    color: colors.secondary,
    transition: 'color 0.1s, opacity 0.1s',
    '&[data-active="true"]': {
      color: colors.primary
    },
    '&[data-disabled="true"]': {
      opacity: 0.3,
      color: colors.secondary
    },
    '&[data-active="false"][data-disabled="false"]:hover': {
      color: colors.text
    }
  }
}

export default {
  Link: {
    Inlines: {
      Link: ({ children, href }) =>
        <A href={href}>
          {children}
        </A>
    },
    UI: {
      Button: props => (
        <span {...{...css(styles.button), ...props}}>
          <LinkIcon />
        </span>
      )
    }
  }
}
