import createPropertyForm from './createPropertyForm'
import { render } from '@testing-library/react'

describe('createPropertyForm test-suite', () => {
  it('utils.createPropertyForm', () => {
    const Form = () => <span data-testid='form' />

    const PropertyForm = createPropertyForm({
      isDisabled: ({ value }) => value.disabled,
    })(Form)

    const { container } = render(<PropertyForm value={{ disabled: true }} />)

    // passes `disabled` property according to response from `options.isDisabled`
    expect(container.querySelector('[disabled=true]')).toBeDefined()
  })
})
