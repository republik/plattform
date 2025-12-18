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
  greeting = 'Herzlichst',
  isLarge = false,
}: {
  authorId: string
  resolvedAuthor: ResolvedAuthor
  isLarge: boolean
  greeting: string
}) => {
  const author = resolvedAuthor || {
    slug: undefined,
    portrait: '/static/placeholder.png',
    name: 'Undefined',
    credentials: [],
  }
  const credential = author.credentials?.find((c) => c.isListed)

  return (
    <>
      {isLarge ? (
        <table
          border={0}
          cellPadding='0'
          cellSpacing='0'
          width='100%'
          style={{ marginTop: 48, marginBottom: 24 }}
        >
          <tbody>
            <tr>
              <td align='center' style={{ lineHeight: '140%' }}>
                <img
                  width='80'
                  height='80'
                  src={author.portrait}
                  style={{
                    border: 0,
                    width: '80px !important',
                    height: '80px !important',
                    margin: 0,
                  }}
                />
                <p
                  style={{
                    fontFamily:
                      'GT-America-Standard-Regular, "Helvetica Neue", Helvetica, sans-serif',
                  }}
                >
                  {greeting}
                  <br />
                  <br />
                  <strong
                    style={{
                      fontFamily:
                        'GT-America-Standard-Medium, "Helvetica Neue", Helvetica, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {author.name}
                  </strong>
                  <br />
                  <br />
                  {credential?.description}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <table
          cellPadding='0'
          cellSpacing='0'
          style={{ marginTop: 48, marginBottom: 24 }}
        >
          <tbody>
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
              <td
                id='sender'
                style={{
                  paddingLeft: 16,
                  lineHeight: '160%',
                  fontFamily:
                    'GT-America-Standard-Regular, "Helvetica Neue", Helvetica, sans-serif',
                }}
              >
                <strong
                  style={{
                    fontFamily:
                      'GT-America-Standard-Medium, "Helvetica Neue", Helvetica, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {author.name}
                </strong>
                <br />
                {credential?.description}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  )
}
