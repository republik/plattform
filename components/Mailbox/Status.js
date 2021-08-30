import React from 'react'
import { css } from 'glamor'

import { MdError } from 'react-icons/md'

import { colors, A, Label } from '@project-r/styleguide'

const styles = {
  error: css({
    color: colors.error
  }),
  icon: css({
    verticalAlign: 'baseline',
    marginRight: 3,
    marginBottom: '-0.2em'
  })
}

const Status = props => {
  const { status, error, onClick } = props

  return (
    <>
      {status !== 'sent' && error && (
        <div>
          <A href='#' onClick={onClick}>
            <span {...styles.error}>
              <MdError size='1.2em' {...styles.icon} /> Problem
            </span>
          </A>
        </div>
      )}
      {status !== 'sent' && !error && (
        <div>
          <Label>{status}</Label>
        </div>
      )}
    </>
  )
}

export default Status
