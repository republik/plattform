import test from 'tape'
import { BaB153Stub } from './Article.stub'
import { renderEmail } from 'mdast-react-render/lib/email'
import { renderMdast } from 'mdast-react-render'
import { parse } from '@orbiting/remark-preset'
import articleEmailSchema from '../Email'
import createSchema from '../index'

const stub = parse(BaB153Stub)

test('templates/article: render web', assert => {
  assert.doesNotThrow(() => {
    renderMdast(stub, createSchema(), { MissingNode: false })
  })

  assert.end()
})

test('templates/article: render email', assert => {
  assert.doesNotThrow(() => {
    renderEmail(stub, articleEmailSchema, { MissingNode: false })
  })

  assert.end()
})
