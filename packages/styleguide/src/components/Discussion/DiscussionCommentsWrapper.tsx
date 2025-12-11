import { css } from 'glamor'
import PropTypes, { InferProps } from 'prop-types'
import React, { FC, PropsWithChildren } from 'react'
import { useColorContext } from '../Colors/ColorContext'
import { LoadMore } from './Tree/LoadMore'

const styles = {
  wrapper: css({
    marginTop: '1rem',
    '& > div:not(:first-child)': {
      marginTop: '2rem',
    },
  }),
}

const propTypes = {
  t: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  moreAvailableCount: PropTypes.number,
  errorMessage: PropTypes.string,
  tagMappings: PropTypes.arrayOf(
    PropTypes.shape({
      tag: PropTypes.string.isRequired,
      color: PropTypes.shape({
        light: PropTypes.string.isRequired,
        dark: PropTypes.string.isRequired,
      }),
    }),
  ),
}

const DiscussionCommentsWrapper: FC<
  PropsWithChildren<InferProps<typeof propTypes>>
> = ({ children, t, loadMore, moreAvailableCount, errorMessage }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.wrapper}>
      {errorMessage && (
        <p {...colorScheme.set('color', 'error')}>{errorMessage}</p>
      )}
      {children}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <LoadMore count={moreAvailableCount} t={t} onClick={loadMore} />
    </div>
  )
}

DiscussionCommentsWrapper.propTypes = propTypes

export default DiscussionCommentsWrapper
