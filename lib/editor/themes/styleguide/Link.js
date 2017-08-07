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
    '&[data-active="true"]': {
      backgroundColor: colors.divider
    },
    '&[data-disabled="true"]': {
      opacity: 0.3,
      backgroundColor: 'transparent'
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
