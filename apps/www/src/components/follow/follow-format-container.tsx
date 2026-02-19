'use client'

import { css } from '@republik/theme/css'
import React from 'react'

function FollowFormatContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={css({
        my: 8,
        pt: 8,
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'text',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      })}
    >
      {children}
    </div>
  )
}

export default FollowFormatContainer
