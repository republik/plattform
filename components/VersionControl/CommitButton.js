import React from 'react'
import withT from '../../lib/withT'
import { Button, A, colors } from '@project-r/styleguide'

const Text = ({
  t, isNew, readOnly, hasUncommittedChanges,
  didUnlock,
  onRevert, onLock
}) => {
  if (isNew) {
    return t('commit/status/new/short')
  }
  if (hasUncommittedChanges) {
    return <A href='#' onClick={onRevert}>
      {t('commit/revert')}
    </A>
  }
  if (readOnly) {
    return t('commit/status/readOnly')
  }
  if (didUnlock) {
    return <A href='#' onClick={onLock}>
      {t('commit/lock')}
    </A>
  }
  return t('commit/status/committed')
}

const CommitButton = (props) => {
  const { t, hasUncommittedChanges, isNew, readOnly, onCommit, onUnlock } = props
  return (
    <div>
      <div style={{ textAlign: 'center', fontSize: '14px', marginTop: 7 }}>
        <Text {...props} />
      </div>
      <Button
        style={{
          margin: '4px 0 0',
          width: '180px',
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
