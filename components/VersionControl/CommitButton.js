import React from 'react'
import { css } from 'glamor'
import withT from '../../lib/withT'
import { Button, A, colors, mediaQueries } from '@project-r/styleguide'

const Text = ({
  t,
  isNew,
  readOnly,
  hasUncommittedChanges,
  didUnlock,
  onRevert,
  onLock
}) => {
  if (isNew) {
    return t('commit/status/new/short')
  }
  if (hasUncommittedChanges) {
    return (
      <A href='#' onClick={onRevert}>
        {t('commit/revert')}
      </A>
    )
  }
  if (readOnly) {
    return t('commit/status/readOnly')
  }
  if (didUnlock) {
    return (
      <A href='#' onClick={onLock}>
        {t('commit/lock')}
      </A>
    )
  }
  return t('commit/status/committed')
}

const CommitButton = props => {
  const {
    t,
    hasUncommittedChanges,
    isNew,
    readOnly,
    onCommit,
    onUnlock
  } = props
  return (
    <div {...css({ width: 100, [mediaQueries.mUp]: { width: 180 } })}>
      <div
        style={{ textAlign: 'center', marginTop: 7 }}
        {...css({ fontSize: 10, [mediaQueries.mUp]: { fontSize: 14 } })}
      >
        <Text {...props} />
      </div>
      <Button
        style={{
          margin: '4px 0 0',
          minWidth: 0,
          height: 40,
          fontSize: '16px',
          backgroundColor: readOnly ? colors.error : undefined,
          borderColor: readOnly ? colors.error : undefined
        }}
        primary
        block
        disabled={!hasUncommittedChanges && !isNew && !readOnly}
        onClick={readOnly ? onUnlock : onCommit}
      >
        {t(readOnly ? 'commit/unlock' : 'commit/button')}
      </Button>
    </div>
  )
}

export default withT(CommitButton)
