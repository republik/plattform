import React from 'react'
import { css } from 'glamor'
import { ResolvedAuthor } from '../Editor/custom-types'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../Typography'
import { PLACEHOLDER } from '../Figure/Slate'
import { RenderLink } from '../Editor/Render/Link'

type FlyerProps = {
  resolvedAuthor?: ResolvedAuthor
  authorId?: string
  attributes: any
  [x: string]: unknown
}

// TODO: replace slug by most recent slug in backend?
export const FlyerAuthor: React.FC<FlyerProps> = ({
  children,
  attributes,
  authorId,
  resolvedAuthor,
  ...props
}) => {
  const [colorScheme] = useColorContext()

  return (
    <RenderLink href={`/~${resolvedAuthor?.slug}`} passhref>
      <div {...attributes} {...props}>
        <div
          contentEditable={false}
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '0 0 10px',
            height: 30,
            opacity: resolvedAuthor ? 1 : 0.4,
            [mUp]: {
              margin: '0 0 20px',
              height: 40,
            },
          }}
        >
          {(!authorId || resolvedAuthor?.portrait) && (
            <img
              style={{ marginRight: 16 }}
              {...css({
                marginRight: 15,
                height: 30,
                width: 30,
                [mUp]: {
                  marginRight: 15,
                  height: 40,
                  width: 40,
                },
              })}
              src={resolvedAuthor?.portrait || PLACEHOLDER}
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
    </RenderLink>
  )
}
