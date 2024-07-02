import React from 'react'
import { css } from 'glamor'
import { LoadMore } from './Tree/LoadMore'
import { useColorContext } from '../Colors/ColorContext'
import ColorContextHelper from './Statements/helpers/ColorContextHelper'
import { Formatter } from '../../lib/translate'

const styles = {
  wrapper: css({
    marginTop: '1rem',
    '& > div:not(:first-child)': {
      marginTop: '2rem',
    },
  }),
}

type DiscussionCommentsWrapperProps = {
  children: React.ReactNode
  t: Formatter
  loadMore: () => void | Promise<void>
  moreAvailableCount: number
  errorMessage?: string
  tagMappings?: Array<{
    tag: string
    color: {
      light: string
      dark: string
    }
  }>
}

const DiscussionCommentsWrapper = ({
  children,
  t,
  loadMore,
  moreAvailableCount,
  errorMessage,
  tagMappings,
}: DiscussionCommentsWrapperProps) => {
  const [colorScheme] = useColorContext()
  return (
    <ColorContextHelper tagMappings={tagMappings}>
      <div {...styles.wrapper}>
        {errorMessage && (
          <p {...colorScheme.set('color', 'error')}>{errorMessage}</p>
        )}
        {children}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <LoadMore count={moreAvailableCount} t={t} onClick={loadMore} />
      </div>
    </ColorContextHelper>
  )
}

export default DiscussionCommentsWrapper
