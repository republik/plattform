import { renderMdast } from 'mdast-react-render'
import React, { useMemo } from 'react'

import { useQuery } from '@apollo/client'
import { Loader, createArticleSchema, slug } from '@project-r/styleguide'

import { useTranslation } from '../../../lib/withT'
import HrefLink from '../../Link/Href'

import { CONTENT_FROM_PAGE_QUERY } from '../../Questionnaire/Submissions/graphql'
import { SubmissionAuthor } from '../../Questionnaire/Submissions/Submission'
import { Mdast } from './index'

type Author = {
  name: string
  // currently, credentials supports links but no other formatting
  credentials: string
  profilePicture: string
}

type QuestionAnswer = {
  content: Mdast
  author: Author
}

const groupNodes = (mdast: Mdast[]): Mdast[][] =>
  mdast.reduce((acc: Mdast[][], current: Mdast) => {
    if (!acc.length) return [[current]]
    const lastElement = acc[acc.length - 1]
    const lastIdentifier = lastElement[lastElement.length - 1].identifier
    // new bucket – infobox acts as separator
    if (lastIdentifier === 'INFOBOX') {
      return acc.concat([[current]])
    }
    return acc.map((el, idx, arr) =>
      idx === arr.length - 1 ? el.concat(current) : el,
    )
  }, [])

// the renderer expects a specific mdast structure...
const wrapContent = (mdast: Mdast[]): Mdast => ({
  type: 'root',
  meta: {
    template: 'article',
  },
  children: [{ identifier: 'CENTER', type: 'zone', children: mdast }],
})

const getText = (node: Mdast): string => {
  if (node.type === 'link')
    return `<a href="${node.url}">${getText(node.children[0])}</a>`
  if (node.type === 'text') return node.value
  return ''
}

const extractData = (mdast: Mdast[]): QuestionAnswer => {
  const infobox = mdast[mdast.length - 1]
  // if we have random crap at the end of the file we ignore it
  if (infobox.identifier !== 'INFOBOX') return

  return {
    content: wrapContent(mdast.slice(0, -1)),
    author: {
      name: infobox.children.find((child) => child.type === 'heading')
        .children[0].value,
      credentials: infobox.children
        .find((child) => child.type === 'paragraph')
        .children.map(getText)
        .join(''),
      profilePicture: infobox.children.find(
        (child) => child.identifier === 'FIGURE',
      )?.children[0].children[0].url,
    },
  }
}

const Header: React.FC<{ author: Author }> = ({ author }) => {
  const customStyle = {
    maxWidth: 695,
    margin: '0 auto',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    zIndex: 10,
  }
  return (
    <>
      {/*
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore */}
      <SubmissionAuthor displayAuthor={author} customStyle={customStyle} />
    </>
  )
}

const RenderQuestion: React.FC<{ mdast: Mdast[] }> = ({ mdast }) => {
  const { t } = useTranslation()
  const answers: QuestionAnswer[] = useMemo(
    () => groupNodes(mdast).map(extractData).filter(Boolean),
    [mdast],
  )

  const schema = useMemo(
    () =>
      createArticleSchema({
        t,
        Link: HrefLink,
      }),
    [t],
  )

  const renderSchema = (content) =>
    renderMdast(content, schema, {
      MissingNode: () => 'Missing!',
    })

  return (
    <>
      {answers.map(({ content, author }, idx) => {
        console.log(author.credentials)
        return (
          <div style={{ marginBottom: 40 }} id={slug(author.name)} key={idx}>
            <Header author={author} />
            {renderSchema(content)}
          </div>
        )
      })}
    </>
  )
}

const QuestionScrollLoader: React.FC<{ contentPath: string }> = ({
  contentPath,
}) => {
  const { data, loading, error } = useQuery(CONTENT_FROM_PAGE_QUERY, {
    variables: { path: contentPath },
  })
  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const mdast = data?.document?.content?.children[1].children
        return mdast ? <RenderQuestion mdast={mdast} /> : null
      }}
    />
  )
}

const QuestionScroll: React.FC<{ contentPath?: string; mdast: Mdast[] }> = ({
  contentPath,
  mdast,
}) =>
  mdast ? (
    <RenderQuestion mdast={mdast} />
  ) : (
    <QuestionScrollLoader contentPath={contentPath} />
  )

export default QuestionScroll
