import React from 'react'
import test from 'tape'
import { shallow } from '../../../test/utils/enzyme'
import createPropertyForm from './createPropertyForm'

test('utils.createPropertyForm', assert => {
  assert.plan(1)

  const Form = () => <span />

  const PropertyForm = createPropertyForm({
    isDisabled: ({ value }) => value.disabled
  })(Form)

  const wrapper = shallow(<PropertyForm value={{ disabled: true }} />)

  assert.equal(
    wrapper.find('[disabled=true]').exists(),
    true,
    'passes `disabled` property according to response from `options.isDisabled`'
  )
})
