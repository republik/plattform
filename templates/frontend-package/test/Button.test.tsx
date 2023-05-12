import { Button } from '@/Button'
import { fireEvent, render, screen } from '@testing-library/react'

describe('Button test-suite', () => {
  test('Button test', async () => {
    const clickHandle = jest.fn()
    render(
      <Button data-testid='foo' onClick={clickHandle}>
        Click me
      </Button>,
    )

    const btn = screen.getByTestId('foo')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Click me')

    await fireEvent.click(btn)
    expect(clickHandle).toHaveBeenCalledTimes(1)
  })

  test('Button test with color', async () => {
    render(<Button color='red'>Click me</Button>)
    const btn = screen.getByText('Click me')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveStyle('background-color: red')
  })
})
