import React from 'react'
import { keyframes, css, compose as glamorCompose } from 'glamor'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import MdHearingIcon from 'react-icons/lib/md/hearing'
import MdRemoveIcon from 'react-icons/lib/md/remove-circle-outline'

import { A, useColorContext } from '@project-r/styleguide'

import * as fragments from '../../lib/graphql/fragments'

const GENERATE_DERIVATIVE = gql`
  mutation generateDerivative($commitId: ID!) {
    generateDerivative(commitId: $commitId) {
      ...SimpleDerivative
    }
  }

  ${fragments.SimpleDerivative}
`

const DESTROY_DERIVATIVE = gql`
  mutation destroyDerivative($id: ID!) {
    destroyDerivative(id: $id) {
      ...SimpleDerivative
    }
  }

  ${fragments.SimpleDerivative}
`

const pulsate = keyframes({
  '0%': { opacity: 0.7 },
  '100%': { opacity: 0.1 },
})

const styles = {
  linkIcon: css({
    cursor: 'pointer',
  }),
  missing: css({
    cursor: 'pointer',
    opacity: 0.3,
  }),
  pending: css({
    animation: `${pulsate} 0.5s linear infinite alternate`,
  }),
  failure: css({
    color: 'red',
  }),
}

const SynthesizedAudio = ({ derivative, onClickGenerate, onClickDestroy }) => {
  const [colorScheme] = useColorContext()

  if (!derivative) {
    return (
      <>
        <MdHearingIcon
          {...glamorCompose(styles.linkIcon, styles.missing)}
          onClick={onClickGenerate}
          size={18}
        />
      </>
    )
  }

  if (derivative.status === 'Pending') {
    return (
      <>
        <MdHearingIcon {...styles.pending} size={18} />
      </>
    )
  }

  if (derivative.status === 'Failure') {
    return (
      <>
        <MdHearingIcon
          {...glamorCompose(styles.linkIcon, styles.failure)}
          {...colorScheme.set('color', 'error')}
          onClick={onClickGenerate}
          size={18}
        />
      </>
    )
  }

  return (
    <>
      <A href={derivative.result.audioUrl} target='_blank'>
        <MdHearingIcon {...styles.linkIcon} size={18} />
      </A>
    </>
  )
}

const Derivatives = ({ commit, generateDerivative, destroyDerivative }) => {
  if (!commit.derivatives) {
    return
  }

  const { derivatives } = commit

  const synthesizedAudio = derivatives
    .filter((d) => d.type === 'SyntheticReadAload')
    .reduce(
      (prev, curr) =>
        (!prev && curr) ||
        (curr.status === 'Ready' && curr) ||
        (curr.status !== 'Ready' && prev.status === 'Ready' && prev) ||
        (curr.status !== 'Ready' && prev.status === 'Pending' && prev) ||
        (curr.status !== 'Ready' && prev.status !== 'Ready' && curr),
      null,
    )

  return (
    <>
      <SynthesizedAudio
        derivative={synthesizedAudio}
        onClickGenerate={generateDerivative}
        onClickDestroy={destroyDerivative}
      />
    </>
  )
}

export default compose(
  graphql(GENERATE_DERIVATIVE, {
    props: ({ mutate, ownProps }) => {
      if (!ownProps.commit?.id) {
        return {}
      }

      return {
        generateDerivative: () =>
          mutate({
            variables: { commitId: ownProps.commit.id },
          }),
      }
    },
  }),
  graphql(DESTROY_DERIVATIVE, {
    props: ({ mutate }) => ({
      destroyDerivative: (id) =>
        mutate({
          variables: { id },
        }),
    }),
  }),
)(Derivatives)
