import hello from '@/hello'

describe('hello test-suite', () => {
  it('should say "hello ${name}"', () => {
    expect(hello('world')).toBe('Hello world!')
  })
})

export {}
