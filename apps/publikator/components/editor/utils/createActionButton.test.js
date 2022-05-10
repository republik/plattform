import { shallow } from '../../../test/utils/enzyme'
import createActionButton from './createActionButton'

describe('createActionButton test-suite', () => {
  it('utils.createActionButton', () => {
    const Button = () => <span />

    const onChange = jest.fn()

    const ActionButton = createActionButton({
      isDisabled: ({ value }) => value.disabled,
      isVisible: ({ value }) => value.visible,
      reducer: (props) => (event) => props.onChange(props, event),
    })(Button)

    const wrapper = shallow(
      <ActionButton
        value={{ disabled: false, visible: false }}
        onChange={onChange}
      />,
    )
    // passes `disabled` property according to response from `options.isDisabled`
    expect(wrapper.find('[disabled=false]').exists()).toBeTruthy()

    //  passes `visible` property according to response from `options.isVisible
    expect(wrapper.find('[visible=false]').exists()).toBeTruthy()

    wrapper.find('Button').simulate('mousedown', { foo: 'bar' })

    // calls `options.reducer` upon mousedown
    expect(onChange).toHaveBeenCalledTimes(1)

    // calls `options.reducer` with props and the mousedown event
    expect(onChange).toHaveBeenLastCalledWith(
      {
        value: { disabled: false, visible: false },
        onChange,
      },
      { foo: 'bar' },
    )

    const disabledWrapper = shallow(<ActionButton value={{ disabled: true }} />)
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

    const wrapperWithProps = shallow(
      <ActionButton
        value={{ disabled: false, visible: true }}
        isVisible={isVisible}
        isDisabled={isDisabled}
        onChange={onChange}
      />,
    )

    // `props.isDisabled` overrides `options.isDisabled`
    expect(wrapperWithProps.find('[disabled=true]').exists()).toBeTruthy()

    // `props.isVisible` overrides `options.isVisible`
    expect(wrapperWithProps.find('[visible=false]').exists()).toBeTruthy()
  })
})
