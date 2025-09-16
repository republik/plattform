import { gql } from '@apollo/client'
import { Query } from '@apollo/client/react/components'

import {
  IconButton,
  Loader,
  Overlay,
  OverlayBody,
  OverlayToolbar,
} from '@project-r/styleguide'

import {
  IconMoreHorizontal as MdMoreHoriz,
  IconWrapText as MdWrapText,
} from '@republik/icons'
import { useState } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'

export const DIFF_QUERY = gql`
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
    parentCommitId: props.commit.parentIds?.[0],
  }

  const newStyles = {
    diffContainer: { wordBreak: 'break-word' },
    wordDiff: { display: 'inline' },
    wordAdded: { display: 'inline' },
    wordRemoved: { display: 'inline' },
  }

  return (
    <>
      <IconButton
        size={24}
        label='Änderungen'
        labelShort=''
        Icon={MdWrapText}
        onClick={handleOnClick}
        invert
        style={{ marginRight: 0 }}
      />
      {isVisible && (
        <Query query={DIFF_QUERY} variables={variables}>
          {({ loading, error, data }) => (
            <Overlay
              onClose={handleOnClose}
              mUpStyle={{ maxWidth: '95vw', minHeight: 'none' }}
            >
              <OverlayToolbar
                title={props.commit.message}
                onClose={handleOnClose}
              />
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
