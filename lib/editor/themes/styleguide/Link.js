import React from 'react'
import { colors, A } from '@project-r/styleguide'
import { css } from 'glamor'
import LinkIcon from 'react-icons/lib/fa/chain'

const styles = {
  button: {
    extAlign: 'center',
    display: 'inline-block',
    padding: '0 2px',
    cursor: 'pointer',
    '&[data-active="true"]': {
      backgroundColor: colors.divider
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
