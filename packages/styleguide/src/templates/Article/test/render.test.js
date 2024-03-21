import { BaB153Stub, ArticleStub } from './article.stub'
import { renderMdast } from '@republik/mdast-react-render'
import { renderEmail } from '@republik/mdast-react-render/email'
import { parse } from '@republik/remark-preset'
import articleEmailSchema from '../email'
import createSchema from '../index'

const babStub = parse(BaB153Stub)
const articleStub = parse(ArticleStub)

describe('chart utils test-suite', () => {
  it.skip('templates/article: render web', () => {
    expect(() => {
      renderMdast(babStub, createSchema(), { MissingNode: false })
    }).not.toThrow()
  })

  it('templates/article: render bab as email', () => {
    expect(() => {
      renderEmail(babStub, articleEmailSchema, { MissingNode: () => null })
    }).not.toThrow()
  })

  it('templates/article: render article as email', () => {
    expect(() => {
      renderEmail(articleStub, articleEmailSchema, { MissingNode: () => null })
    }).not.toThrow()
  })
})
