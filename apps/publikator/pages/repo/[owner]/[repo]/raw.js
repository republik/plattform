import {
  A,
  Button,
  Checkbox,
  colors,
  fontFamilies,
  mediaQueries,
} from '@project-r/styleguide'
import {
  IconInfoOutline as InfoIcon,
  IconLens as CircleIcon,
} from '@republik/icons'
import { parse, stringify } from '@republik/remark-preset'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import withAuthorization from '../../../../components/Auth/withAuthorization'
import Nav from '../../../../components/editor/Nav'
import Frame from '../../../../components/Frame'
import BranchingNotice from '../../../../components/VersionControl/BranchingNotice'
import {
  UncommittedChanges,
  withUncommitedChanges,
} from '../../../../components/VersionControl/UncommittedChanges'
import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'
import initLocalStore from '../../../../lib/utils/localStorage'
import withT from '../../../../lib/withT'

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
  require('../../../../components/editor/utils/codemirror-md')
  require('codemirror/addon/fold/foldcode')
  require('codemirror/addon/fold/foldgutter')
  require('codemirror/addon/fold/xml-fold')
}

const hasOpenSections = (md) => {
  if (!md) return
  // in synch with our remark-preset
  // https://github.com/orbiting/mdast/blob/fabbd146dd16f7bdcbf7b699c5bac7161f14d197/packages/remark-preset/src/index.js#L23-L28
  const openTags = md.match(/<section>\s*<h6>([^<]+)<\/h6>/g)
  const closeTags = md.match(/<hr\s*\/>\s*<\/section>/g)
  return openTags?.length !== closeTags?.length
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
    const [md, setMd] = useState('')
    const [meta, setMeta] = useState(undefined)
    const [foldCode, setFoldCode] = useState(false)
    const [editMeta, setEditMeta] = useState(false)
    const [validity, setValidity] = useState(true)

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
      const editedMdast = editMeta
        ? parse(md)
        : {
            ...parse(md),
            meta,
          }

      if (!editedMdast.meta.template) {
        editedMdast.meta.template = meta.template
      }
      store.set('editorState', editedMdast)
      goToEditor()
    }

    const onEditMeta = () => {
      if (editMeta) return
      setEditMeta(true)
      const contentAndMeta = stringify({
        ...parse(md),
        meta,
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
      const documentSchema = store.get('editorState').meta?.template || schema
      setFoldCode(documentSchema !== 'front')
      const editorMdast = { ...store.get('editorState'), meta: {} }
      setMd(stringify(editorMdast))
    }, [store])

    useEffect(() => {
      setValidity(!hasOpenSections(md))
    }, [md])

    return (
      <Frame raw>
        <Frame.Header isTemplate={isTemplate === 'true'}>
          <Frame.Header.Section align='left'>
            <Nav isTemplate={isTemplate === 'true'} />
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
                disabled={!validity}
                onClick={validity && onSave}
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
            <div className='Info'>
              <A
                href='https://github.com/orbiting/publikator-frontend/blob/master/docs/raw.md'
                target='_blank'
              >
                <InfoIcon />
              </A>
            </div>
            <div className='Checkbox' style={{ opacity: editMeta ? 0.5 : 1 }}>
              <Checkbox checked={editMeta} onChange={onEditMeta}>
                {t('pages/raw/metadata')}
              </Checkbox>
            </div>
            {md !== '' ? (
              <CodeMirror
                value={md}
                options={{
                  mode: 'markdown',
                  theme: 'neo',
                  lineNumbers: true,
                  lineWrapping: true,
                  smartIndent: false,
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
                  setMd(value)
                }}
              />
            ) : null}
          </div>
        </Frame.Body>
      </Frame>
    )
  }),
)
