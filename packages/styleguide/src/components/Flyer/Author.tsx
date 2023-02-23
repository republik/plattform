import React, { ReactNode } from 'react'
import { css } from 'glamor'
import { ResolvedAuthor } from '../Editor/custom-types'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles, plainLinkRule } from '../Typography'
import { PLACEHOLDER } from '../Figure/Slate'
import { useRenderContext } from '../Editor/Render/Context'

type FlyerProps = {
  children?: ReactNode
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

  const author = resolvedAuthor || {
    slug: undefined,
    portrait: PLACEHOLDER,
    name: t('editor/element/flyerAuthor'),
  }

  const Tag = author.slug ? 'a' : 'span'
  const content = (
    <Tag
      {...styles.container}
      {...plainLinkRule}
      contentEditable={false}
      style={{
        opacity: resolvedAuthor ? 1 : 0.4,
      }}
    >
      {(!author.status || author.status === 'exists') &&
        (author.portrait || !authorId) && (
          <img
            {...styles.portrait}
            src={author.portrait || PLACEHOLDER}
            alt=''
          />
        )}
      <span {...styles.name} {...colorScheme.set('color', 'flyerText')}>
        {author.name}
      </span>
    </Tag>
  )

  return (
    <div {...attributes} {...props}>
      {author.slug ? (
        <Link href={`/~${author.slug}`} passHref>
          {content}
        </Link>
      ) : (
        content
      )}
      {children}
    </div>
  )
}
