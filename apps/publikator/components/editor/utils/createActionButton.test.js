import React from 'react'
import test from 'tape'
import spy from 'spy'
import { shallow } from '../../../test/utils/enzyme'
import createActionButton from './createActionButton'

test('utils.createActionButton', assert => {
  assert.plan(7)

  const Button = () => <span />

  const onChange = spy()

  const ActionButton = createActionButton({
    isDisabled: ({ value }) => value.disabled,
    isVisible: ({ value }) => value.visible,
    reducer: props => event => props.onChange(props, event)
  })(Button)

  const wrapper = shallow(
    <ActionButton
      value={{ disabled: false, visible: false }}
      onChange={onChange}
    />
  )

  assert.equal(
    wrapper.find('[disabled=false]').exists(),
    true,
    'passes `disabled` property according to response from `options.isDisabled`'
  )

  assert.equal(
    wrapper.find('[visible=false]').exists(),
    true,
    'passes `visible` property according to response from `options.isVisible`'
  )

  wrapper.find('Button').simulate('mousedown', { foo: 'bar' })

  assert.equal(onChange.callCount, 1, 'calls `options.reducer` upon mousedown')

  assert.equal(
    onChange.calledWith(
      {
        value: { disabled: false, visible: false },
        onChange
      },
      { foo: 'bar' }
    ),
    true,
    'calls `options.reducer` with props and the mousedown event'
  )

  const disabledWrapper = shallow(<ActionButton value={{ disabled: true }} />)
  const preventDefault = spy()
  disabledWrapper.find('Button').simulate('mousedown', { preventDefault })

  assert.equal(
    preventDefault.callCount,
    1,
    'calls preventDefault() on the mousedown event if `options.isDisabled` returns true '
  )

  const isVisible = (props, visible) => {
    return !visible
  }

  const isDisabled = (props, disabled) => {
    return !disabled
  }

  const wrapperWithProps = shallow(
    <ActionButton
      value={{ disabled: false, visible: true }}
      isVisible={isVisible}
      isDisabled={isDisabled}
      onChange={onChange}
    />
  )

  assert.equal(
    wrapperWithProps.find('[disabled=true]').exists(),
    true,
    '`props.isDisabled` overrides `options.isDisabled`'
  )

  assert.equal(
    wrapperWithProps.find('[visible=false]').exists(),
    true,
    '`props.isVisible` overrides `options.isVisible`'
  )
})
