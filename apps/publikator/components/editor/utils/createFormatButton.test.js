import React from 'react'
import test from 'tape'
import spy from 'spy'
import { shallow } from '../../../test/utils/enzyme'
import createFormatButton from './createFormatButton'

test('utils.createFormatButton', assert => {
  assert.plan(9)

  const Button = () => <span />

  const onChange = spy()

  const FormatButton = createFormatButton({
    isDisabled: ({ value }) => value.disabled,
    isActive: ({ value }) => value.active,
    isVisible: ({ value }) => value.visible,
    reducer: props => event => props.onChange(props, event)
  })(Button)

  const wrapper = shallow(
    <FormatButton
      value={{ active: true, disabled: false, visible: true }}
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

  assert.equal(
    wrapper.find('[visible=true]').exists(),
    true,
    'passes `visible` property according to response from `options.isVisible`'
  )

  wrapper.find('Button').simulate('mousedown', { foo: 'bar' })

  assert.equal(onChange.callCount, 1, 'calls `options.reducer` upon mousedown')

  assert.equal(
    onChange.calledWith(
      {
        value: { active: true, disabled: false, visible: true },
        onChange
      },
      { foo: 'bar' }
    ),
    true,
    'calls `options.reducer` with props and the mousedown event'
  )

  const disabledWrapper = shallow(
    <FormatButton value={{ active: true, disabled: true }} />
  )
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

  const isActive = (props, active) => {
    return !active
  }

  const wrapperWithProps = shallow(
    <FormatButton
      value={{ active: true, disabled: false, visible: true }}
      isVisible={isVisible}
      isDisabled={isDisabled}
      isActive={isActive}
      onChange={onChange}
    />
  )

  assert.equal(
    wrapperWithProps.find('[active=false]').exists(),
    true,
    '`props.isActive` overrides `options.isActive`'
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
