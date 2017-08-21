import React from 'react'
import test from 'tape'
import spy from 'spy'
import { shallow } from 'enzyme'
import createFormatButton from './createFormatButton'

test('utils.createFormatButton', assert => {
  assert.plan(5)

  const Button = () => (
    <span />
  )

  const onChange = spy()

  const FormatButton = createFormatButton({
    isDisabled: ({ state }) => state.disabled,
    isActive: ({ state }) => state.active,
    reducer: props => event =>
      props.onChange(props, event)
  })(Button)

  const wrapper = shallow(
    <FormatButton
      state={{ active: true, disabled: false }}
      onChange={onChange}
    />
  )

  assert.equal(
    wrapper.find('[active=true]').exists(),
    true,
    'passes `active` property according to response from `options.isActive`'
  )

  assert.equal(
    wrapper.find('[disabled=false]').exists(),
    true,
    'passes `disabled` property according to response from `options.isDisabled`'
  )

  wrapper.find('Button').simulate('mousedown', { foo: 'bar' })

  assert.equal(
    onChange.callCount,
    1,
    'calls `options.reducer` upon mousedown'
  )

  assert.equal(
    onChange.calledWith(
      {
        state: { active: true, disabled: false },
        onChange
      },
      { foo: 'bar' }
    ),
    true,
    'calls `options.reducer` with props and the mousedown event'
  )

  const disabledWrapper = shallow(<FormatButton state={{ active: true, disabled: true }} />)
  const preventDefault = spy()
  disabledWrapper.find('Button').simulate('mousedown', { preventDefault })

  assert.equal(
    preventDefault.callCount,
    1,
    'calls preventDefault() on the mousedown event if `options.isDisabled` returns true '
  )
})
