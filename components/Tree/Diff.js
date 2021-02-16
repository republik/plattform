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
        content
      }

      parentCommit: commit(id: $parentCommitId) {
        id
        content
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
                <OverlayToolbarConfirm
                  onClick={handleOnClose}
                  label={<MdClose size={24} />}
                />
              </OverlayToolbar>
              <OverlayBody style={{ fontSize: 13 }}>
                <Loader
                  loading={loading}
                  error={error}
                  render={() => (
                    <ReactDiffViewer
                      newValue={data.repo.commit.content}
                      oldValue={data.repo.parentCommit.content}
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
