import Link from 'next/link'
import { css } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import { IconCheck } from '@republik/icons'

import { getHighlight } from '../../lib/typesense-adapter'
import { formatExcerpt } from '@/lib/utils/format'
import { Highlight } from './highlight'

export function ProfileResult({ profile }) {
  const nameSnippet = getHighlight(profile.highlights, 'name')
  const textSnippet =
    getHighlight(profile.highlights, 'biography') ??
    getHighlight(profile.highlights, 'statement')

  const href = `/~${profile.slug || profile.id}`

  return (
    <div
      className={css({
        pb: 4,
        mb: 4,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        position: 'relative',
        md: { gap: 4 },
      })}
    >
      {profile.portrait && (
        <img
          src={profile.portrait}
          width='84'
          height='84'
          alt=''
          className={css({ flexShrink: 0 })}
        />
      )}
      <div>
        <h4 className={css({ fontWeight: 'bold', lineHeight: '1.2' })}>
          <Link href={href} className={linkOverlay()}>
            {nameSnippet ? <Highlight snippet={nameSnippet} /> : profile.name}
          </Link>
        </h4>
        {profile.credential && (
          <p
            className={css({
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: profile.credential.verified ? 'text' : 'textSoft',
            })}
          >
            {profile.credential.description}
            {profile.credential.verified && (
              <IconCheck size={14} className={css({ fill: 'primary' })} />
            )}
          </p>
        )}
        {!nameSnippet && textSnippet && (
          <p
            className={css({
              fontSize: 14,
              color: 'textSoft',
              lineHeight: '1.2',
              wordBreak: 'break-word',
            })}
          >
            <Highlight snippet={formatExcerpt(textSnippet)} />
          </p>
        )}
      </div>
    </div>
  )
}
