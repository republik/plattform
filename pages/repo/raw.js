import React, { useState, useEffect } from 'react'
import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'
import initLocalStore from '../../lib/utils/localStorage'
import { withRouter } from 'next/router'
import withT from '../../lib/withT'
import withAuthorization from '../../components/Auth/withAuthorization'
import withMe from '../../lib/withMe'
import { compose } from 'react-apollo'
import { stringify, parse } from '@orbiting/remark-preset'
import { css } from 'glamor'
import {
  A,
  Button,
  mediaQueries,
  colors,
  fontFamilies,
  Checkbox
} from '@project-r/styleguide'
import { Router } from '../../lib/routes'
import CircleIcon from 'react-icons/lib/md/lens'
import { Controlled as CodeMirror } from 'react-codemirror2'
import {
  UncommittedChanges,
  withUncommitedChanges,
  withUncommittedChangesMutation
} from '../../components/VersionControl/UncommittedChanges'
import BranchingNotice from '../../components/VersionControl/BranchingNotice'

const styles = css({
  background: colors.secondaryBg,
  minHeight: 'calc(100vh - 80px)',
  padding: 10,
  '& .Checkbox': {
    position: 'absolute',
    left: 'calc(50% + 415px)',
    top: 95
  },
  '& .CodeMirror': {
    height: 'auto',
    width: 800,
    margin: 'auto',
    border: `1px solid ${colors.divider}`,
    fontFamily: fontFamilies.monospaceRegular,
    fontSize: 14,
    color: colors.text,
    lineHeight: 2
  },
  '& pre.CodeMirror-line': {
    padding: '0 15px'
  }
})

// CodeMirror can only run in the browser
if (process.browser) {
  require('../../components/editor/utils/codemirror-md')
  require('codemirror/addon/fold/foldcode')
  require('codemirror/addon/fold/foldgutter')
  require('codemirror/addon/fold/xml-fold')
}

const hasOpenSections = md => {
  if (!md) return
  const openTags = md.match(/<section>/g)
  const closeTags = md.match(/<hr \/><\/section>/g)
  if (!openTags || !closeTags) return
  return openTags.length !== closeTags.length
}

export default compose(
  withRouter,
  withT,
  withAuthorization(['editor']),
  withMe,
  withUncommitedChanges({
    options: ({ router }) => ({
      variables: {
        repoId: router.query.repoId
      }
    })
  }),
  withUncommittedChangesMutation
)(({ t, router, uncommittedChanges }) => {
  const { repoId, commitId } = router.query
  const [store, setStore] = useState(undefined)
  const [md, setMd] = useState('')
  const [meta, setMeta] = useState(undefined)
  const [editMeta, setEditMeta] = useState(false)
  const [validity, setValidity] = useState(true)

  const goToEditor = () => {
    Router.pushRoute('repo/edit', {
      repoId: repoId.split('/'),
      commitId,
      ...(commitId === 'new'
        ? { template: store.get('editorState').meta.template }
        : {})
    })
  }

  const onSave = () => {
    const editedMdast = editMeta
      ? parse(md)
      : {
          ...parse(md),
          meta
        }
    store.set('editorState', editedMdast)
    goToEditor()
  }

  const onEditMeta = () => {
    if (editMeta) return
    setEditMeta(true)
    const contentAndMeta = stringify({
      ...parse(md),
      meta
    })
    setMd(contentAndMeta)
  }

  useEffect(() => {
    const storeKey = [repoId, commitId].join('/')
    setStore(initLocalStore(storeKey))
  }, [repoId, commitId])

  useEffect(() => {
    if (!store) return
    setMeta(store.get('editorState').meta)
    const editorMdast = { ...store.get('editorState'), meta: {} }
    setMd(stringify(editorMdast))
  }, [store])

  useEffect(() => {
    setValidity(!hasOpenSections(md))
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
          <div style={{ padding: '35px 25px' }}>
            <CircleIcon
              style={{ color: validity ? colors.containerBg : colors.error }}
            />
          </div>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <div
            {...css({
              width: 100,
              [mediaQueries.mUp]: { width: 180 }
            })}
          >
            <div
              style={{ textAlign: 'center', marginTop: 7 }}
              {...css({ fontSize: 10, [mediaQueries.mUp]: { fontSize: 14 } })}
            >
              <A href='#' onClick={goToEditor}>
                {t('pages/raw/cancel')}
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
              {t('pages/raw/save')}
            </Button>
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
          <div className='Checkbox' style={{ opacity: editMeta ? 0.5 : 1 }}>
            <Checkbox checked={editMeta} onChange={onEditMeta}>
              {t('pages/raw/metadata')}
            </Checkbox>
          </div>
          <CodeMirror
            value={md}
            options={{
              mode: 'markdown',
              theme: 'neo',
              lineNumbers: true,
              lineWrapping: true,
              smartIndent: false,
              viewportMargin: Infinity,
              foldGutter: true,
              gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
              foldOptions: process.browser && {
                rangeFinder: require('codemirror').fold.xml
              }
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
