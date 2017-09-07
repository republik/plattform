import test from 'tape'
import { cleanName, initials } from './clean'

test('lib.utils.cleanName', assert => {
  assert.equal(
    cleanName(' John Doe '),
    'John Doe',
    'Name trimmed'
  )
  assert.equal(
    cleanName('john.doe@project-r.construction'),
    'John Doe',
    'Name extracted from email'
  )
  assert.end()
})

test('lib.utils.initials', assert => {
  assert.equal(
    initials(' John Doe '),
    'JD',
    'Initials extracted from dirty name'
  )
  assert.equal(
    initials(cleanName(' John Doe ')),
    'JD',
    'Initials extracted from cleaned name'
  )
  assert.equal(
    initials(cleanName('john.doe@project-r.construction')),
    'JD',
    'Initials extracted from email'
  )
  assert.end()
})
