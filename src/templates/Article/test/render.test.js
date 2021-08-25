import test from 'tape'
import { BaB153Stub, ArticleStub } from './article.stub'
import { renderEmail } from 'mdast-react-render/lib/email'
import { renderMdast } from 'mdast-react-render'
import { parse } from '@orbiting/remark-preset'
import articleEmailSchema from '../email'
import createSchema from '../index'

const babStub = parse(BaB153Stub)
const articleStub = parse(ArticleStub)

test('templates/article: render web', assert => {
  assert.doesNotThrow(() => {
    renderMdast(babStub, createSchema(), { MissingNode: false })
  })

  assert.end()
})

test('templates/article: render bab as email', assert => {
  assert.doesNotThrow(() => {
    renderEmail(babStub, articleEmailSchema, { MissingNode: false })
  })

  assert.end()
})

test('templates/article: render article as email', assert => {
  assert.doesNotThrow(() => {
    renderEmail(articleStub, articleEmailSchema, { MissingNode: false })
  })

  assert.end()
})
