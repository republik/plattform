import React from 'react'
import withT from '../../lib/withT'
import { Button, A } from '@project-r/styleguide'

const CommitButton = ({ t, uncommittedChanges, isNew, onCommit, onRevert }) => (
  <div>
    <div style={{ textAlign: 'center', fontSize: '14px', marginTop: 7 }}>
      {!isNew && uncommittedChanges
          ? <A href='#' onClick={onRevert}>
            {t('commit/revert')}
          </A>
          : isNew
          ? <span>{t('commit/status/new/short')}</span>
          : <span>{t('commit/status/committed')}</span>
        }
    </div>
    <Button
      style={{ margin: '4px 0 0', width: '180px', height: 40, fontSize: '16px' }}
      primary
      block
      disabled={!uncommittedChanges && !isNew}
      onClick={onCommit}
    >
      {t('commit/button')}
    </Button>
  </div>
)

export default withT(CommitButton)
