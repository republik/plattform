import React from 'react'
import test from 'tape'
import spy from 'spy'
import { shallow } from 'enzyme'
import createActionButton from './createActionButton'

test('utils.createActionButton', assert => {
  assert.plan(4)

  const Button = () => (
    <span />
  )

  const onChange = spy()

  const ActionButton = createActionButton({
    isDisabled: ({ state }) => state.disabled,
    reducer: props => event =>
      props.onChange(props, event)
  })(Button)

  const wrapper = shallow(
    <ActionButton
      state={{ disabled: false }}
      onChange={onChange}
    />
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
        state: { disabled: false },
        onChange
      },
      { foo: 'bar' }
    ),
    true,
    'calls `options.reducer` with props and the mousedown event'
  )

  const disabledWrapper = shallow(<ActionButton state={{ disabled: true }} />)
  const preventDefault = spy()
  disabledWrapper.find('Button').simulate('mousedown', { preventDefault })

  assert.equal(
    preventDefault.callCount,
    1,
    'calls preventDefault() on the mousedown event if `options.isDisabled` returns true '
  )
})
