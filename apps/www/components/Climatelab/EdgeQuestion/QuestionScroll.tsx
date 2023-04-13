import { renderMdast } from 'mdast-react-render'
import { useRouter } from 'next/router'
import React, { useMemo, useEffect, useRef } from 'react'
import scrollIntoView from 'scroll-into-view'

import { createArticleSchema, slug, pxToRem } from '@project-r/styleguide'

import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { cleanAsPath } from '../../../lib/utils/link'
import { useTranslation } from '../../../lib/withT'

import Meta from '../../Frame/Meta'
import HrefLink from '../../Link/Href'
import { SubmissionAuthor } from '../../Questionnaire/Submissions/Submission'

import HeaderShare from '../shared/HeaderShare'

import { PORTRAITS } from './config'
import { Author, QuestionAnswer, ShareProps } from './index'

type MetaProps = {
  url: string
  title: string
  description: string
  image: string
}

const Header: React.FC<{ author: Author }> = ({ author, children }) => {
  const customStyle = {
    maxWidth: 695,
    margin: '0 auto',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
    zIndex: 10,
  }

  const customStylePicture = {
    width: pxToRem(80),
    height: pxToRem(80),
  }

  return (
    <>
      {/*
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore */}
      <SubmissionAuthor
        displayAuthor={{
          ...author,
          profilePicture: PORTRAITS[slug(author.name)],
        }}
        customStyle={customStyle}
        customStylePicture={customStylePicture}
      >
        {children}
      </SubmissionAuthor>
    </>
  )
}

const Answer: React.FC<{
  author: Author
  meta: MetaProps
  sharedAnswer?: QuestionAnswer
  renderedContent: any
}> = ({ author, meta, sharedAnswer, renderedContent }) => {
  const authorSlug = slug(author.name)
  const ref = useRef()
  useEffect(() => {
    if (sharedAnswer && sharedAnswer.author.name === author.name) {
      scrollIntoView(ref.current, { align: { top: 0 } })
    }
  }, [])
  return (
    <div style={{ marginBottom: 40 }} ref={ref} className={authorSlug}>
      <Header author={author}>
        <HeaderShare
          meta={{
            ...meta,
            url: `${cleanAsPath(meta.url)}?share=${authorSlug}`,
          }}
          noLabel
        />
      </Header>
      {renderedContent}
    </div>
  )
}

const QuestionScroll: React.FC<{
  answers: QuestionAnswer[]
  share: ShareProps
}> = ({ answers, share = {} }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { query } = router
  const answerId = query.share
  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('extract', share.extract)
  const shareImageUrl = shareImageUrlObj.toString()

  const sharedAnswer =
    answerId && answers.find((d) => slug(d.author.name) === answerId)
  const meta: MetaProps = {
    url,
    title: share.title,
    description: share.description.replace(
      '{name}',
      sharedAnswer ? sharedAnswer.author.name : '',
    ),
    image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
      shareImageUrl,
    )}`,
  }

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
      {answerId && <Meta data={meta} />}
      {answers.map(({ content, author }, idx) => (
        <Answer
          key={idx}
          author={author}
          meta={meta}
          renderedContent={renderSchema(content)}
          sharedAnswer={sharedAnswer}
        />
      ))}
    </>
  )
}

export default QuestionScroll
