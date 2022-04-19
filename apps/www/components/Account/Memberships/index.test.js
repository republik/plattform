import { Item } from '../Elements'
import { render, screen } from '@testing-library/react'

describe('/components/Account/index.js', () => {
  it('should should render formatted createdAt', () => {
    render(<Item createdAt={new Date(2018, 0, 15)} />)

    expect(
      screen.getByText('Erstellt am 15. Januar 2018 um 00:00'),
    ).toBeTruthy()
  })
})
