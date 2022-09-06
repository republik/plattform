import React from 'react'
import { css } from 'glamor'
import { ResolvedAuthor } from '../Editor/custom-types'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../Typography'
import { PLACEHOLDER } from '../Figure/Slate'
import { useRenderContext } from '../Editor/Render/Context'

type FlyerProps = {
  resolvedAuthor?: ResolvedAuthor
  authorId?: string
  attributes: any
  [x: string]: unknown
}

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 10px',
    height: 30,
    [mUp]: {
      margin: '0 0 20px',
      height: 40,
    },
  }),
  portrait: css({
    marginRight: 15,
    height: 30,
    width: 30,
    [mUp]: {
      height: 40,
      width: 40,
    },
  }),
  name: css({
    ...fontStyles.sansSerifRegular,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 15,
    lineHeight: 0.867,
    [mUp]: {
      fontSize: 16,
      lineHeight: 0.938,
    },
  }),
}

export const FlyerAuthor: React.FC<FlyerProps> = ({
  children,
  attributes,
  authorId,
  resolvedAuthor,
  ...props
}) => {
  const { Link, t } = useRenderContext()
  const [colorScheme] = useColorContext()

  return (
    <Link href={`/~${resolvedAuthor?.slug}`} passhref>
      <a {...attributes} {...props}>
        <div
          contentEditable={false}
          {...styles.container}
          style={{
            opacity: resolvedAuthor ? 1 : 0.4,
          }}
        >
          {(!authorId || resolvedAuthor?.portrait) && (
            <img
              {...styles.portrait}
              src={resolvedAuthor?.portrait || PLACEHOLDER}
              alt=''
            />
          )}
          <span {...styles.name} {...colorScheme.set('color', 'flyerText')}>
            {resolvedAuthor?.name || t('editor/element/flyerAuthor')}
          </span>
        </div>
        {children}
      </a>
    </Link>
  )
}
