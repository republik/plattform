import React from 'react'
import { css } from 'glamor'
import { ResolvedAuthor } from '../Editor/custom-types'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../Typography'

export const FlyerAuthor: React.FC<{
  resolvedAuthor?: ResolvedAuthor
  authorId?: string
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, authorId, resolvedAuthor, ...props }) => {
  const [colorScheme] = useColorContext()

  return (
    <div {...attributes} {...props}>
      <div
        contentEditable={false}
        style={{
          display: 'flex',
          alignItems: 'center',
          margin: '0 0 10px',
          opacity: resolvedAuthor ? 1 : 0.4,
          [mUp]: {
            margin: '0 0 20px',
          },
        }}
      >
        {resolvedAuthor?.portrait && (
          <img
            style={{ marginRight: 16 }}
            {...css({
              marginRight: 15,
              height: 30,
              [mUp]: {
                marginRight: 15,
                height: 40,
              },
            })}
            src={resolvedAuthor.portrait}
          />
        )}
        <span
          {...css({
            ...fontStyles.sansSerifRegular,
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontSize: 15,
            lineHeight: 0.867,
            [mUp]: {
              fontSize: 16,
              lineHeight: 0.938,
            },
          })}
          {...colorScheme.set('color', 'journalText')}
        >
          {resolvedAuthor?.name || 'Author'}
        </span>
      </div>
      {children}
    </div>
  )
}
