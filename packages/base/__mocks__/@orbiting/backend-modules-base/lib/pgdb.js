const mockedPogi = {
  queryOneField: jest.fn()
}

module.exports = {
  connect: async () => mockedPogi
}
