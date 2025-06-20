import { css } from '@republik/theme/css'
import React from 'react'

export function NextReadsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className={css({ borderTop: '1px solid black', py: 4 })}>
      <h3
        className={css({
          fontFamily: 'gtAmericaStandard',
          fontWeight: 700,
          fontSize: 20,
          lineHeight: 1,
          mb: 4,
        })}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}
