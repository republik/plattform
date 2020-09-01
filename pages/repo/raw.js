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
import TextareaAutosize from 'react-textarea-autosize'
import { css } from 'glamor'
import { A, Button, mediaQueries, colors } from '@project-r/styleguide'
import { Router } from '../../lib/routes'
import CircleIcon from 'react-icons/lib/md/lens'
import gql from 'graphql-tag'
import * as fragments from '../../lib/graphql/fragments'

const getCommitById = gql`
  query getCommitById($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      commit(id: $commitId) {
        ...CommitWithDocument
      }
    }
  }
  ${fragments.CommitWithDocument}
`

export default compose(
  withRouter,
  withT,
  withAuthorization(['editor']),
  withMe,
  graphql(getCommitById, {
    skip: ({ router }) =>
      router.query.commitId === 'new' || !router.query.commitId,
    options: ({ router }) => ({
      variables: {
        repoId: router.query.repoId,
        commitId: router.query.commitId
      }
    })
  })
)(({ router, data }) => {
  const { repoId, commitId } = router.query
  const [store, setStore] = useState(undefined)
  const storeRef = useRef()
  storeRef.current = store
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
    const editorMd = stringify(editorMdast)
    setMd(editorMd)
  }

  const onMdChange = e => {
    const newMd = e.target.value
    setMd(newMd)
    const newMdast = parse(newMd)
    if (newMdast.meta.errors) {
      setValidity(false)
    } else {
      setMdast(newMdast)
      setValidity(true)
    }
  }

  const goToEditor = () => {
    Router.pushRoute('repo/edit', { repoId, commitId })
  }

  const onSave = () => {
    storeRef.current.set('editorState', mdast)
    goToEditor()
  }

  useEffect(() => {
    const storeKey = [repoId, commitId].join('/')
    setStore(initLocalStore(storeKey))
  }, [repoId, commitId])

  useEffect(() => {
    if (!store) return
    resetMd()
  }, [store])

  // TODO: import codemirror (mode & css) and insert
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
          <Frame.Me />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw>
        <TextareaAutosize
          style={{ width: 800, padding: 20, margin: 20 }}
          value={md}
          onChange={onMdChange}
        />
      </Frame.Body>
    </Frame>
  )
})
