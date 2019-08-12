import { css } from 'glamor'
import React from 'react'
import ChevronRight from 'react-icons/lib/md/keyboard-arrow-right'

import { sansSerifRegular30 } from '../Typography/styles'

// Placeholder for next/Link
const Link = ({ children }) => <div>{children}</div>

const styles = {
  link: css({
    display: 'inline-block',
    cursor: 'pointer',
    ...sansSerifRegular30,
    margin: '0 0 30px 0'
  }),
  label: css({
    display: 'inline-block',
    ...sansSerifRegular30,
    margin: '0 0 30px 0'
  }),
  icon: css({
    marginLeft: '8px'
  })
}

const Title = ({ children, href }) => {
  return (
    <React.Fragment>
      {href ? (
        <Link href={href}>
          <a {...styles.link}>
            {children}
            {<ChevronRight {...styles.icon} size={24} />}
          </a>
        </Link>
      ) : (
        <div {...styles.label}>{children}</div>
      )}
    </React.Fragment>
  )
}

export default Title
