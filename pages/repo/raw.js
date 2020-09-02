import React, { useState, useEffect, useRef } from 'react'
import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'
import initLocalStore from '../../lib/utils/localStorage'
import { withRouter } from 'next/router'
import withT from '../../lib/withT'
import withAuthorization from '../../components/Auth/withAuthorization'
import withMe from '../../lib/withMe'
import { compose, graphql } from 'react-apollo'
import { stringify, parse } from '@orbiting/remark-preset'
import { css } from 'glamor'
import {
  A,
  Button,
  mediaQueries,
  colors,
  fontFamilies
} from '@project-r/styleguide'
import { Router } from '../../lib/routes'
import CircleIcon from 'react-icons/lib/md/lens'
import gql from 'graphql-tag'
import { Controlled as CodeMirror } from 'react-codemirror2'
import {
  UncommittedChanges,
  withUncommitedChanges,
  withUncommittedChangesMutation
} from '../../components/VersionControl/UncommittedChanges'
import BranchingNotice from '../../components/VersionControl/BranchingNotice'

const METADATA_SEPARATOR = '---\n\n'

const styles = css({
  background: colors.secondaryBg,
  padding: 10,
  '& .CodeMirror': {
    height: 'auto',
    width: 800,
    margin: 'auto',
    border: `1px solid ${colors.divider}`,
    fontFamily: fontFamilies.monospaceRegular,
    fontSize: 13,
    color: colors.text,
    lineHeight: 2
  },
  '& pre.CodeMirror-line': {
    padding: '0 15px'
  }
})

const getDocumentContent = gql`
  query getDocumentContent($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      commit(id: $commitId) {
        document {
          content
        }
      }
    }
  }
`

// yeah I know that's ugly
if (typeof window !== 'undefined') {
  require('codemirror/mode/markdown/markdown')
  // TODO: collapse sections -> doesnt work grrrr!
  require('codemirror/addon/fold/foldcode')
  require('codemirror/addon/fold/foldgutter')
  require('codemirror/addon/fold/xml-fold')
}

export default compose(
  withRouter,
  withT,
  withAuthorization(['editor']),
  withMe,
  graphql(getDocumentContent, {
    skip: ({ router }) =>
      router.query.commitId === 'new' || !router.query.commitId,
    options: ({ router }) => ({
      variables: {
        repoId: router.query.repoId,
        commitId: router.query.commitId
      }
    })
  }),
  withUncommitedChanges({
    options: ({ router }) => ({
      variables: {
        repoId: router.query.repoId
      }
    })
  }),
  withUncommittedChangesMutation
)(({ t, router, data, uncommittedChanges, hasUncommitedChanges }) => {
  const { repoId, commitId } = router.query
  const [store, setStore] = useState(undefined)
  const storeRef = useRef()
  storeRef.current = store
  const [meta, setMeta] = useState('')
  const [md, setMd] = useState('')
  const [mdast, setMdast] = useState(null)
  const [validity, setValidity] = useState(true)

  const resetMd = () => {
    const editorMdast =
      storeRef.current.get('editorState') ||
      (data &&
        data.repo &&
        data.repo.commit &&
        data.repo.commit.document &&
        data.repo.commit.document.content)
    if (!editorMdast) return
    const editorMd = stringify(editorMdast)
    const splitMd = editorMd.split(METADATA_SEPARATOR)
    setMeta(splitMd[0] + METADATA_SEPARATOR)
    setMd(splitMd[1])
  }

  const goToEditor = () => {
    Router.pushRoute('repo/edit', { repoId, commitId })
  }

  const onSave = () => {
    if (mdast) {
      storeRef.current.set('editorState', mdast)
    }
    goToEditor()
  }

  useEffect(() => {
    const storeKey = [repoId, commitId].join('/')
    setStore(initLocalStore(storeKey))
    hasUncommitedChanges({ repoId, action: 'create' })
    return () => hasUncommitedChanges({ repoId, action: 'delete' })
  }, [repoId, commitId])

  useEffect(() => {
    if (!store) return
    resetMd()
  }, [store])

  useEffect(() => {
    const newMdast = parse(meta + md)
    if (newMdast.meta.errors) {
      setValidity(false)
    } else {
      setMdast(newMdast)
      setValidity(true)
    }
  }, [md])

  return (
    <Frame raw>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav>
            <RepoNav route='repo/edit' />
          </Frame.Nav>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <div
            {...css({
              width: 100,
              marginRight: 25,
              [mediaQueries.mUp]: { width: 180 }
            })}
          >
            <div
              style={{ textAlign: 'center', marginTop: 7 }}
              {...css({ fontSize: 10, [mediaQueries.mUp]: { fontSize: 14 } })}
            >
              <A href='#' onClick={goToEditor}>
                Zurück
              </A>
            </div>
            <Button
              style={{
                margin: '4px 0 0',
                minWidth: 0,
                height: 40,
                fontSize: '16px'
              }}
              primary
              block
              disabled={!validity}
              onClick={validity && onSave}
            >
              Speichern
            </Button>
          </div>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <div style={{ padding: '35px 25px' }}>
            <CircleIcon
              style={{ color: validity ? colors.primary : colors.error }}
            />
          </div>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <BranchingNotice asIcon repoId={repoId} currentCommitId={commitId} />
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <UncommittedChanges uncommittedChanges={uncommittedChanges} t={t} />
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <Frame.Me />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw>
        <div {...styles}>
          <CodeMirror
            value={md}
            options={{
              mode: 'markdown',
              theme: 'neo',
              lineNumbers: true,
              lineWrapping: true,
              smartIndent: false,
              viewportMargin: Infinity,
              foldGutter: true
            }}
            onBeforeChange={(editor, data, value) => {
              setMd(value)
            }}
          />
        </div>
      </Frame.Body>
    </Frame>
  )
})
