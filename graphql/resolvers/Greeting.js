module.exports = {
  id () {
    return 'greeting'
  },
  text ({ text }, args, { user }) {
    return text
      .replace('{name}', user.name)
  }
}
