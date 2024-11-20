import { useState } from 'react'
import { Query } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'

import {
  IconWrapText as MdWrapText,
  IconMoreHorizontal as MdMoreHoriz,
} from '@republik/icons'

import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  Loader,
  IconButton,
} from '@project-r/styleguide'

const DIFF_QUERY = gql`
  query TreeDiff($repoId: ID!, $commitId: ID!, $parentCommitId: ID!) {
    repo(id: $repoId) {
      id

      commit: commit(id: $commitId) {
        id
        document {
          content
        }
      }

      parentCommit: commit(id: $parentCommitId) {
        id
        document {
          content
        }
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
      {isVisible &&
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
                    newValue={JSON.stringify(
                      data.repo.commit.document.content,
                      null,
                      2,
                    )}
                    styles={newStyles}
                    splitView={false}
                    oldValue={JSON.stringify(
                      data.repo.parentCommit.document.content,
                      null,
                      2,
                    )}
                    compareMethod={DiffMethod.LINES}
                    extraLinesSurroundingDiff={1}
                    codeFoldMessageRenderer={() => <MdMoreHoriz />}
                  />
                )}
              />
            </OverlayBody>
          </Overlay>
        )}
      </Query>
      }
    </>
  )
}
