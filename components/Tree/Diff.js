import React, { useState } from 'react'
import { css } from 'glamor'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import MdClose from 'react-icons/lib/md/close'
import MdMoreHoriz from 'react-icons/lib/md/more-horiz'
import MdWrapText from 'react-icons/lib/md/wrap-text'

import {
  Overlay,
  OverlayToolbar,
  OverlayToolbarConfirm,
  OverlayToolbarClose,
  OverlayBody,
  Loader,
  Interaction
} from '@project-r/styleguide'

const styles = {
  linkDiff: css({
    cursor: 'pointer'
  })
}

export const TREE_DIFF_QUERY = gql`
  query TreeDiff($repoId: ID!, $commitId: ID!, $parentCommitId: ID!) {
    repo(id: $repoId) {
      id

      commit: commit(id: $commitId) {
        id
        markdown
      }

      parentCommit: commit(id: $parentCommitId) {
        id
        markdown
      }
    }
  }
`

export default function TreeDiff(props) {
  const [isVisible, setIsVisible] = useState(false)

  function handleOnClick(e) {
    e.preventDefault()
    setIsVisible(true)
  }

  function handleOnClose(e) {
    setIsVisible(false)
  }

  if (!props.commit?.parentIds?.length) {
    return null
  }

  const variables = {
    repoId: props.repoId,
    commitId: props.commit.id,
    parentCommitId: props.commit.parentIds?.[0]
  }

  const newStyles = {
    diffContainer: { wordBreak: 'break-word' },
    wordDiff: { display: 'inline' },
    wordAdded: { display: 'inline' },
    wordRemoved: { display: 'inline' }
  }

  return (
    <>
      <MdWrapText size={18} {...styles.linkDiff} onClick={handleOnClick} />
      {isVisible && (
        <Query query={TREE_DIFF_QUERY} variables={variables}>
          {({ loading, error, data }) => (
            <Overlay
              onClose={handleOnClose}
              mUpStyle={{ maxWidth: '95vw', minHeight: 'none' }}
            >
              <OverlayToolbar>
                <Interaction.Emphasis
                  style={{ padding: '15px 20px', fontSize: 16 }}
                >
                  {props.commit.message}
                </Interaction.Emphasis>
                <OverlayToolbarClose onClick={handleOnClose} />
              </OverlayToolbar>
              <OverlayBody style={{ fontSize: 13 }}>
                <Loader
                  loading={loading}
                  error={error}
                  render={() => (
                    <ReactDiffViewer
                      newValue={data.repo.commit.markdown}
                      styles={newStyles}
                      splitView={false}
                      oldValue={data.repo.parentCommit.markdown}
                      compareMethod={DiffMethod.WORDS_WITH_SPACE}
                      extraLinesSurroundingDiff={1}
                      codeFoldMessageRenderer={() => <MdMoreHoriz />}
                    />
                  )}
                />
              </OverlayBody>
            </Overlay>
          )}
        </Query>
      )}
    </>
  )
}
