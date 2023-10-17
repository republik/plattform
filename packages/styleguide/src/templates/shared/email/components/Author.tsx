import { css } from 'glamor'
import React from 'react'

type Credential = {
  description: string
  verified: boolean
  isListed: boolean
}

type ResolvedAuthor = {
  name: string
  portrait: string
  slug: string
  credentials: Credential[]
  status?: 'exists' | 'missing'
}

export const Author = ({
  authorId,
  resolvedAuthor,
}: {
  authorId: string
  resolvedAuthor: ResolvedAuthor
}) => {
  const author = resolvedAuthor || {
    slug: undefined,
    portrait: '/static/placeholder.png',
    name: 'Undefined',
    credentials: [],
  }
  const credential = author.credentials?.find((c) => c.isListed)

  return (
    <table id='sender' style={{ marginTop: 48, marginBottom: 24 }}>
      <tr>
        <td>
          <img
            width='72'
            height='72'
            src={author.portrait}
            style={{
              border: 0,
              width: '72px !important',
              height: '72px !important',
              margin: 0,
              maxWidth: '100% !important',
            }}
          />
        </td>
        <td id='sender' style={{ paddingLeft: 12, lineHeight: '160%' }}>
          <strong>{author.name}</strong>
          <br />
          {credential?.description}
        </td>
      </tr>
    </table>
  )
}
