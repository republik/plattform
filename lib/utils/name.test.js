import test from 'tape'
import { getName, getInitials } from './name'

test('lib.utils.clean.getName', assert => {
  assert.equal(
    getName({
      name: ' John Doe '
    }),
    'John Doe',
    'Name trimmed'
  )
  assert.equal(
    getName({
      email: 'john.doe@project-r.construction'
    }),
    'John Doe',
    'Name extracted from email'
  )
  assert.end()
})

test('lib.utils.clean.getInitials', assert => {
  assert.equal(
    getInitials({
      name: 'John Doe'
    }),
    'JD',
    'Initials extracted from name'
  )
  assert.equal(
    getInitials({
      name: ' ',
      email: 'john.doe@project-r.construction'
    }),
    'JD',
    'Initials extracted from email when name is blank'
  )
  assert.equal(
    getInitials({
      email: 'john.doe@project-r.construction'
    }),
    'JD',
    'Initials extracted from email'
  )
  assert.end()
})
