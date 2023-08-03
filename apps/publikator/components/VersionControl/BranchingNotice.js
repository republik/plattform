import { useState } from 'react'
import { Subscription } from '@apollo/client/react/components'
import { IconCallSplit as NewerVersionIcon } from '@republik/icons'

import { Button, colors } from '@project-r/styleguide'
import { getCommits, repoSubscription } from './index'
import Link from 'next/link'
import { descending } from 'd3-array'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'

const getColors = (warning) => ({
  backgroundColor: warning ? 'var(--color-social)' : 'inherit',
  borderColor: warning ? 'var(--color-social)' : 'inherit',
  color: warning ? '#fff' : 'inherit',
})

const BranchingIcon = ({ repoId, warning }) => (
  <div
    title={`Neuere Version verfügbar${
      warning ? ': dieses Commit wird ein Baum erzeugen' : ''
    }`}
  >
    <Link href={`/repo/${repoId}/tree`}>
      <Button
        style={{
          ...getColors(warning),
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

const BranchingButton = ({ repoId, warning }) => (
  <Link href={`/repo/${repoId}/tree`}>
    <Button
      style={{
        ...getColors(warning),
        marginBottom: 10,
      }}
      primary={warning}
      block
    >
      <NewerVersionIcon style={{ marginBottom: 4, marginRight: 4 }} /> Neuere
      Version
    </Button>
  </Link>
)

const BranchingNotice = ({
  asIcon,
  repoId,
  commit,
  commits,
  hasUncommittedChanges,
}) => {
  const [isStale, setIsStale] = useState(false)

  const commitsBehind = [...commits]
    .sort(function (a, b) {
      return descending(new Date(a.date), new Date(b.date))
    })
    .map((c) => c.id)
    .indexOf(commit.id)

  const isBehind = !!commitsBehind && commitsBehind > 0

  if (isStale || isBehind) {
    const BranchingComponent = asIcon ? BranchingIcon : BranchingButton
    return (
      <BranchingComponent repoId={repoId} warning={hasUncommittedChanges} />
    )
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
          data.repoChange.commit.id !== commit.id
        ) {
          setIsStale(true)
        }
      }}
    />
  )
}

export default compose(
  graphql(getCommits, {
    options: (props) => ({
      fetchPolicy: 'network-only',
    }),
  }),
)(({ asIcon, repoId, commit, hasUncommittedChanges, data = {} }) => {
  const { repo } = data
  if (!repo) return null
  return (
    <BranchingNotice
      asIcon={asIcon}
      repoId={repoId}
      commit={commit}
      commits={repo.commits?.nodes}
      hasUncommittedChanges={hasUncommittedChanges}
    />
  )
})
