module.exports = {
  id () {
    return 'greeting'
  },
  text ({ text }, args, { user, t }) {
    return text
      .replace(/{name}/g, user.name || t('api/noname'))
      .replace(/{firstName}/g, user.firstName || t('api/noname'))
      .replace(/{lastName}/g, user.lastName || t('api/noname'))
  }
}
