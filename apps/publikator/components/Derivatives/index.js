import React, { useState } from 'react'
import { keyframes, css } from 'glamor'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import MdHearingIcon from 'react-icons/lib/md/hearing'
import { IconButton, AudioPlayer, mediaQueries } from '@project-r/styleguide'

import * as fragments from '../../lib/graphql/fragments'
import withT from '../../lib/withT'

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
  audioPlayer: css({
    backgroundColor: 'white',
    padding: 12,
  }),
  audioPlayerContainer: css({
    position: 'fixed',
    zIndex: 100,
    boxShadow: '0 0 10px rgba(0,0,0,0.15)',
    width: '100%',
    right: 0,
    bottom: 0,
    transition: 'opacity ease-out 0.3s',
    [mediaQueries.mUp]: {
      width: 400,
      right: 24,
      bottom: 24,
    },
  }),
}

const SynthesizedAudio = withT(
  ({ t, derivative, onClickGenerate, onClickDestroy }) => {
    const [showAudioPlayer, setShowAudioPlayer] = useState(false)

    return (
      <>
        {!derivative ? (
          <IconButton
            invert
            style={{ marginRight: 0 }}
            Icon={MdHearingIcon}
            label='Audio generieren'
            labelShort=''
            size={24}
            onClick={onClickGenerate}
          />
        ) : derivative.status === 'Pending' ? (
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
        ) : derivative.status === 'Failure' ? (
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
        ) : (
          <IconButton
            invert
            style={{ marginRight: 0 }}
            fillColorName='primary'
            Icon={MdHearingIcon}
            label='Abspielen'
            labelShort=''
            size={24}
            onClick={() => setShowAudioPlayer(true)}
          />
        )}
        {showAudioPlayer && (
          <diy {...styles.audioPlayerContainer}>
            <div {...styles.audioPlayer}>
              <AudioPlayer
                src={{
                  mp3: derivative.result.audioUrl,
                }}
                closeHandler={() => setShowAudioPlayer(false)}
                autoPlay
                scrubberPosition='bottom'
                t={t}
              />
            </div>
          </diy>
        )}
      </>
    )
  },
)

const Derivatives = ({ commit, generateDerivative, destroyDerivative }) => {
  if (!commit.derivatives) {
    return
  }

  const { derivatives, canDeriveSyntheticReadAloud } = commit

  const synthesizedAudio = derivatives
    .filter((d) => d.type === 'SyntheticReadAloud')
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
      {canDeriveSyntheticReadAloud && (
        <SynthesizedAudio
          derivative={synthesizedAudio}
          onClickGenerate={generateDerivative}
          onClickDestroy={destroyDerivative}
        />
      )}
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
