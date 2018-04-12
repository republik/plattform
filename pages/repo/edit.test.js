import React from 'react'
import test from 'tape'
import setupTestData from '../../lib/apollo/setupTestData'
import { mount } from '../../lib/utils/enzyme'
import '../../lib/utils/jsdom'

import { t } from '../../lib/withT'
import { parse } from '@orbiting/remark-preset'

import { EditorPage } from './edit'

const me = {
  __typename: 'User',
  id: '8a724320-5d4e-4991-9055-ec03db7122c2',
  name: 'Test Engine',
  firstName: 'Test',
  lastName: 'Engine',
  email: 'test@project-r.construction',
  roles: ['editor']
}

const testData = setupTestData({
  apollo: {
    data: {
      ROOT_QUERY: {
        me: {
          type: 'id',
          id: `${me.__typename}:${me.id}`,
          generated: false
        }
      },
      [`${me.__typename}:${me.id}`]: me
    }
  }
})

const EditorPageWithTestData = testData.withData(
  EditorPage
)

test('EditorPage is write-able', assert => {
  const wrapper = mount(
    <EditorPageWithTestData
      t={t}
      me={me}
      url={{
        query: {
          repoId: 'orbiting/test',
          commitId: '1'
        }
      }}
      data={{
        loading: false,
        error: undefined,
        repo: {
          meta: {},
          commit: {
            document: {
              meta: {
                template: 'article'
              },
              content: parse(`---
template: article
---

<section><h6>TITLE</h6>

# Title 1

Lead

Von Autor

<hr /></section>

<section><h6>CENTER</h6>

Text

<hr /></section>
              `)
            }
          }
        }
      }}
      commitMutation={() => {
        Promise.resolve({
          data: {
            commit: {
              id: '2'
            }
          }
        })
      }}
      uncommittedChanges={{
        loading: false,
        error: undefined,
        users: []
      }}
      uncommittedChangesMutation={() => {
        return Promise.resolve({
          data: {
            uncommittedChanges: true
          }
        })
      }}
    />
  )

  const page = wrapper.find(EditorPage).instance()

  assert.equal(
    page.state.readOnly,
    false,
    'is not readOnly when alone'
  )

  assert.end()
})
