/* eslint-disable @typescript-eslint/no-require-imports */
// -> we need them for codemirror

import { useState, useEffect } from 'react'
import Frame from '../../../../components/Frame'
import initLocalStore from '../../../../lib/utils/localStorage'
import { withRouter } from 'next/router'
import withT from '../../../../lib/withT'
import withAuthorization from '../../../../components/Auth/withAuthorization'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import {
  A,
  Button,
  mediaQueries,
  colors,
  fontFamilies,
} from '@project-r/styleguide'
import { Controlled as CodeMirror } from 'react-codemirror2'
import {
  UncommittedChanges,
  withUncommitedChanges,
} from '../../../../components/VersionControl/UncommittedChanges'
import BranchingNotice from '../../../../components/VersionControl/BranchingNotice'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'
import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import Nav from '../../../../components/Edit/Nav'

const styles = css({
  background: colors.secondaryBg,
  minHeight: 'calc(100vh - 80px)',
  padding: 10,
  '& .Checkbox': {
    display: 'inline-block',
    margin: 5,
    marginLeft: 'calc(50% + 210px)',
  },
  '& .Info': {
    position: 'fixed',
    right: 25,
    top: 95,
  },
  '& .CodeMirror': {
    height: 'auto',
    width: 800,
    margin: 'auto',
    border: `1px solid ${colors.divider}`,
    fontFamily: fontFamilies.monospaceRegular,
    fontSize: 14,
    color: colors.text,
    lineHeight: 2,
  },
  '& pre.CodeMirror-line': {
    padding: '0 15px',
  },
})

// CodeMirror can only run in the browser
if (process.browser) {
  window.jsonlint = require('jsonlint-mod')
  require('codemirror/mode/javascript/javascript')
  require('codemirror/mode/htmlmixed/htmlmixed')
  require('codemirror/addon/edit/matchbrackets')
  require('codemirror/addon/edit/closebrackets')
  require('codemirror/addon/lint/lint')
  require('codemirror/addon/lint/json-lint')
  require('codemirror/addon/fold/foldcode')
  require('codemirror/addon/fold/foldgutter')
  require('codemirror/addon/fold/xml-fold')
}

const stringify = (json) => (json ? JSON.stringify(json, null, 2) : '')

const safeParse = (string) => {
  let json
  try {
    json = JSON.parse(string)
  } catch (e) {}
  return json
}

export default withDefaultSSR(
  compose(
    withRouter,
    withT,
    withAuthorization(['editor']),
    withUncommitedChanges({
      options: ({ router }) => ({
        variables: {
          repoId: getRepoIdFromQuery(router.query),
        },
      }),
    }),
  )(({ t, router, uncommittedChanges }) => {
    const repoId = getRepoIdFromQuery(router.query)
    const { commitId, schema, template, isTemplate } = router.query
    const [store, setStore] = useState(undefined)
    const [stringifiedMdast, setStringifiedMdast] = useState('')
    const [foldCode, setFoldCode] = useState(false)

    const goToEditor = (e) => {
      if (e) e.preventDefault()
      router.push({
        pathname: `/repo/${repoId}/edit`,
        query: {
          ...router.query,
          commitId,
          ...(commitId === 'new'
            ? { schema: schema || template, isTemplate }
            : {}),
        },
      })
    }

    const onSave = (e) => {
      if (e) e.preventDefault()
      store.set('editorState', safeParse(stringifiedMdast))
      goToEditor()
    }

    useEffect(() => {
      const storeKey = [repoId, commitId].join('/')
      setStore(initLocalStore(storeKey))
    }, [repoId, commitId])

    useEffect(() => {
      if (!store) return
      const documentSchema = store.get('editorState').meta?.template || schema
      setFoldCode(documentSchema !== 'front')
      setStringifiedMdast(stringify(store.get('editorState')))
    }, [store])

    return (
      <Frame raw>
        <Frame.Header isTemplate={isTemplate === 'true'}>
          <Frame.Header.Section align='left'>
            <Nav isTemplate={isTemplate === 'true'} />
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            <div
              {...css({
                width: 100,
                [mediaQueries.mUp]: { width: 180 },
              })}
            >
              <div
                style={{ textAlign: 'center', marginTop: 7 }}
                {...css({ fontSize: 10, [mediaQueries.mUp]: { fontSize: 14 } })}
              >
                <A href={`/repo/${repoId}/edit`} onClick={goToEditor}>
                  {t('pages/raw/cancel')}
                </A>
              </div>
              <Button
                style={{
                  margin: '4px 0 0',
                  minWidth: 0,
                  height: 40,
                  fontSize: '16px',
                }}
                primary
                block
                onClick={onSave}
              >
                {t('pages/raw/save')}
              </Button>
            </div>
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            <BranchingNotice
              asIcon
              repoId={repoId}
              commit={{
                id: commitId,
              }}
            />
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
              value={stringifiedMdast}
              options={{
                theme: 'neo',
                mode: 'application/json',
                lint: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                autofocus: true,
                lineNumbers: true,
                lineWrapping: true,
                smartIndent: true,
                viewportMargin: Infinity,
                foldGutter: foldCode,
                gutters: [
                  'CodeMirror-linenumbers',
                  foldCode && 'CodeMirror-foldgutter',
                ].filter(Boolean),
                foldOptions: process.browser &&
                  foldCode && {
                    rangeFinder: require('codemirror').fold.xml,
                  },
              }}
              onBeforeChange={(editor, data, value) => {
                setStringifiedMdast(value)
              }}
            />

          </div>
        </Frame.Body>
      </Frame>
    )
  }),
)
