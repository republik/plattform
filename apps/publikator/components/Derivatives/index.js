import React from 'react'
import { keyframes } from 'glamor'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import MdHearingIcon from 'react-icons/lib/md/hearing'
import MdRemoveIcon from 'react-icons/lib/md/remove-circle-outline'

import { IconButton } from '@project-r/styleguide'

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

const SynthesizedAudio = ({ derivative, onClickGenerate, onClickDestroy }) => {
  if (!derivative) {
    return (
      <IconButton
        invert
        style={{ marginRight: 0 }}
        Icon={MdHearingIcon}
        label='Audio generieren'
        labelShort=''
        size={24}
        onClick={onClickGenerate}
      />
    )
  }

  if (derivative.status === 'Pending') {
    return (
      <IconButton
        invert
        style={{
          marginRight: 0,
          animation: `${pulsate} 0.5s linear infinite alternate`,
        }}
        Icon={MdHearingIcon}
        label='Wird generiert'
        labelShort=''
        size={24}
        disabled
      />
    )
  }

  if (derivative.status === 'Failure') {
    return (
      <>
        <IconButton
          invert
          style={{ marginRight: 0 }}
          fillColorName='error'
          Icon={MdHearingIcon}
          label='Fehler. Neu generieren'
          labelShort=''
          onClick={onClickGenerate}
          size={24}
        />
      </>
    )
  }

  return (
    <IconButton
      invert
      style={{ marginRight: 0 }}
      fillColorName='primary'
      Icon={MdHearingIcon}
      label='Abspielen'
      labelShort=''
      size={24}
      href={derivative.result.audioUrl}
      target='_blank'
    />
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
