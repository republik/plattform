import { useState } from 'react'
import { keyframes, css } from 'glamor'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import {
  IconButton,
  AudioPlayer,
  mediaQueries,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Interaction,
} from '@project-r/styleguide'
import { IconHearing, IconPlay } from '@republik/icons'

import * as fragments from '../../lib/graphql/fragments'
import withT from '../../lib/withT'
import { COMMIT_LIMIT, getRepoHistory } from "../../pages/repo/[owner]/[repo]/tree";
import { getRepoWithPublications } from "../Publication/Current";

const { P } = Interaction

const GENERATE_DERIVATIVE = gql`
  mutation generateDerivative($commitId: ID!) {
    generateDerivative(commitId: $commitId) {
      ...SimpleDerivative
    }
  }

  ${fragments.SimpleDerivative}
`

const pulsate = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0.2 },
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

const SynthesizedAudio = withT(({ t, derivative, associatedDerivative, onClickGenerate }) => {
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  return (
    <>
      {!derivative ? (
        <IconButton
          invert
          style={{ marginRight: 0 }}
          Icon={IconHearing}
          label='Audio-Version erzeugen'
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
          Icon={IconHearing}
          label='Audio-Version wird erzeugt'
          labelShort=''
          size={24}
          disabled
        />
      ) : derivative.status === 'Failure' ? (
        <>
          <IconButton
            invert
            style={{ marginRight: 0 }}
            fillColorName='error'
            Icon={IconHearing}
            label='Audio-Version fehlerhaft'
            labelShort='Fehler'
            size={24}
            onClick={() => setShowErrorMessage(true)}
          />
          {showErrorMessage && (
            <Overlay onClose={() => setShowErrorMessage(false)}>
              <OverlayToolbar
                title='Audio-Version fehlerhaft'
                onClose={() => setShowErrorMessage(false)}
              />
              <OverlayBody>
                <P>Fehlermeldung: {JSON.stringify(derivative.result.error)}</P>
                <P>Derivative-ID: {derivative.id}</P>
                <IconButton
                  style={{ marginTop: 10 }}
                  Icon={IconHearing}
                  label='Audio-Version erneut erzeugen'
                  labelShort=''
                  size={24}
                  onClick={() => {
                    onClickGenerate()
                    setShowErrorMessage(false)
                  }}
                />
              </OverlayBody>
            </Overlay>
          )}
        </>
      ) : (
        <IconButton
          invert
          style={{ marginRight: 0 }}
                Icon={IconPlay}
          label='Audio-Version anhören'
          labelShort='anhören'
          size={24}
          onClick={() => setShowAudioPlayer(true)}
        />
      )}
      {showAudioPlayer && (
        <div {...styles.audioPlayerContainer}>
          <div {...styles.audioPlayer}>
            <AudioPlayer
              src={{
                mp3: derivative.result.audioAssetsUrl,
              }}
              closeHandler={() => setShowAudioPlayer(false)}
              autoPlay
              scrubberPosition='bottom'
              t={t}
            />
          </div>
        </div>
      )}
    </>
  )
})

const Derivatives = ({ commit, repoId, showAssociated, generateDerivative }) => {
  if (!commit.derivatives) {
    return null
  }

  const { derivatives, associatedDerivative, canDeriveSyntheticReadAloud } = commit

  const synthesizedAudio = showAssociated ? associatedDerivative : derivatives.find(
    (d) => d.type === 'SyntheticReadAloud',
  )

  return (
    <>
      {canDeriveSyntheticReadAloud && (
        <SynthesizedAudio
          derivative={synthesizedAudio}
          onClickGenerate={generateDerivative}
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
            refetchQueries: [
              {
                query: getRepoHistory,
                variables: {
                  repoId: ownProps.repoId,
                  first: COMMIT_LIMIT,
                },
              },
              {
                query: getRepoWithPublications,
                variables: {
                  repoId: ownProps.repoId,
                },
              },
            ],

          }),
      }
    },
  }),
)(Derivatives)
