import { BaB153Stub, ArticleStub } from './article.stub'
import { renderEmail } from 'mdast-react-render/lib/email'
import { renderMdast } from 'mdast-react-render'
import { parse } from '@orbiting/remark-preset'
import articleEmailSchema from '../email'
import createSchema from '../index'

const babStub = parse(BaB153Stub)
const articleStub = parse(ArticleStub)

describe('chart utils test-suite', () => {
  it('templates/article: render web', () => {
    expect(() => {
      renderMdast(babStub, createSchema(), { MissingNode: false })
    }).not.toThrow()
  })

  it('templates/article: render bab as email', () => {
    expect(() => {
      renderEmail(babStub, articleEmailSchema, { MissingNode: false })
    }).not.toThrow()
  })

  it('templates/article: render article as email', () => {
    expect(() => {
      renderEmail(articleStub, articleEmailSchema, { MissingNode: false })
    }).not.toThrow()
  })
})
