module.exports = {
  id () {
    return 'greeting'
  },
  text ({ text }, args, { user }) {
    return text
      .replace(/{name}/g, user.name)
      .replace(/{firstName}/g, user.firstName)
      .replace(/{lastName}/g, user.lastName)
  }
}
