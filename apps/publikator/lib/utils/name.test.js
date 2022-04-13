import { getName, getInitials } from './name'

describe('name util test-suite', () => {
  it('lib.utils.clean.getName', () => {
    // Name trimmed
    expect(
      getName({
        name: ' John Doe ',
      }),
    ).toBe('John Doe')

    // Name extracted from email
    expect(
      getName({
        email: 'john.doe@project-r.construction',
      }),
    ).toBe('John Doe')
  })

  it('lib.utils.clean.getInitials', () => {
    // Initials extracted from name
    expect(
      getInitials({
        name: 'John Doe',
      }),
    ).toBe('JD')

    // Initials extracted from email when name is blank
    expect(
      getInitials({
        name: ' ',
        email: 'john.doe@project-r.construction',
      }),
    ).toBe('JD')

    // Initials extracted from email
    expect(
      getInitials({
        email: 'john.doe@project-r.construction',
      }),
    ).toBe('JD')
  })
})
