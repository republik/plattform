import React from 'react'
import test from 'tape'
import { shallow } from 'enzyme'
import createPropertyForm from './createPropertyForm'

test('utils.createPropertyForm', assert => {
  assert.plan(1)

  const Form = () => (
    <span />
  )

  const PropertyForm = createPropertyForm({
    isDisabled: ({ state }) => state.disabled
  })(Form)

  const wrapper = shallow(
    <PropertyForm
      state={{ disabled: true }}
    />
  )

  assert.equal(
    wrapper.find('[disabled=true]').exists(),
    true,
    'passes `disabled` property according to response from `options.isDisabled`'
  )
})
