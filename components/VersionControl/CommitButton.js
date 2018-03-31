import React from 'react'
import withT from '../../lib/withT'
import { Button, A, colors } from '@project-r/styleguide'

const CommitButton = ({ t, hasUncommittedChanges, isNew, readOnly, onCommit, onRevert, onBeginChanges }) => (
  <div>
    <div style={{ textAlign: 'center', fontSize: '14px', marginTop: 7 }}>
      {!isNew && hasUncommittedChanges
          ? <A href='#' onClick={onRevert}>
            {t('commit/revert')}
          </A>
          : <span>{t(
              isNew
                ? 'commit/status/new/short'
                : readOnly
                  ? 'commit/status/readOnly'
                  : 'commit/status/committed'
            )}</span>
        }
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
      onClick={readOnly ? onBeginChanges : onCommit}
    >
      {t(readOnly ? 'commit/begin' : 'commit/button')}
    </Button>
  </div>
)

export default withT(CommitButton)
