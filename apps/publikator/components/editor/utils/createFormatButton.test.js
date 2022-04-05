import React from 'react'
import { shallow } from '../../../test/utils/enzyme'
import createFormatButton from './createFormatButton'

describe('createFormatButton test-suite', () => {
  it('utils.createFormatButton', () => {
    const Button = () => <span />

    const onChange = jest.fn()

    const FormatButton = createFormatButton({
      isDisabled: ({ value }) => value.disabled,
      isActive: ({ value }) => value.active,
      isVisible: ({ value }) => value.visible,
      reducer: (props) => (event) => props.onChange(props, event),
    })(Button)

    const wrapper = shallow(
      <FormatButton
        value={{ active: true, disabled: false, visible: true }}
        onChange={onChange}
      />,
    )

    // passes `active` property according to response from `options.isActive`
    expect(wrapper.find('[active=true]').exists()).toBeTruthy()

    // passes `disabled` property according to response from `options.isDisabled`
    expect(wrapper.find('[disabled=false]').exists()).toBeTruthy()

    // passes `visible` property according to response from `options.isVisible`
    expect(wrapper.find('[visible=true]').exists()).toBeTruthy()

    wrapper.find('Button').simulate('mousedown', { foo: 'bar' })

    // calls `options.reducer` upon mousedown
    expect(onChange).toHaveBeenCalledTimes(1)

    // calls `options.reducer` with props and the mousedown event
    expect(onChange).toHaveBeenLastCalledWith(
      {
        value: { active: true, disabled: false, visible: true },
        onChange,
      },
      { foo: 'bar' },
    )

    const disabledWrapper = shallow(
      <FormatButton value={{ active: true, disabled: true }} />,
    )
    const preventDefault = jest.fn()
    disabledWrapper.find('Button').simulate('mousedown', { preventDefault })

    // calls preventDefault() on the mousedown event if `options.isDisabled` returns true
    expect(preventDefault).toHaveBeenCalledTimes(1)

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
      />,
    )

    // `props.isActive` overrides `options.isActive`
    expect(wrapperWithProps.find('[active=false]').exists()).toBeTruthy()

    // `props.isDisabled` overrides `options.isDisabled`
    expect(wrapperWithProps.find('[disabled=true]').exists()).toBeTruthy()

    // `props.isVisible` overrides `options.isVisible`
    expect(wrapperWithProps.find('[visible=false]').exists()).toBeTruthy()
  })
})
