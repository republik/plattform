import { useState } from 'react'
import { Subscription } from '@apollo/client/react/components'
import { MdCallSplit as NewerVersionIcon } from 'react-icons/md'

import { Button, colors } from '@project-r/styleguide'

import { repoSubscription } from './index'
import { Link } from '../../lib/routes'

const WarningIcon = ({ repoId }) => (
  <div title='Neuere Version verfügbar'>
    <Link route='repo/tree' params={{ repoId: repoId.split('/') }}>
      <Button
        style={{
          backgroundColor: colors.social,
          borderColor: colors.social,
          color: '#fff',
          height: 40,
          marginRight: 4,
          marginTop: 27,
          minWidth: 40,
          padding: 0,
          width: 40,
        }}
      >
        <NewerVersionIcon style={{ marginTop: -5 }} />
      </Button>
    </Link>
  </div>
)

const WarningButton = ({ repoId }) => (
  <Link route='repo/tree' params={{ repoId: repoId.split('/') }}>
    <Button
      style={{
        backgroundColor: colors.social,
        borderColor: colors.social,
        marginBottom: 10,
      }}
      primary
      block
    >
      <NewerVersionIcon style={{ marginBottom: 4, marginRight: 4 }} /> Neuere
      Version
    </Button>
  </Link>
)

const BranchingNotice = ({ asIcon, repoId, currentCommitId }) => {
  const [isStale, setIsStale] = useState(false)

  if (isStale) {
    if (asIcon) {
      return <WarningIcon repoId={repoId} />
    }

    return <WarningButton repoId={repoId} />
  }

  return (
    <Subscription
      subscription={repoSubscription}
      variables={{ repoId }}
      onSubscriptionData={({ subscriptionData: { data } }) => {
        if (
          data &&
          data.repoChange &&
          data.repoChange.commit &&
          data.repoChange.commit.id !== currentCommitId
        ) {
          setIsStale(true)
        }
      }}
    />
  )
}

export default BranchingNotice
