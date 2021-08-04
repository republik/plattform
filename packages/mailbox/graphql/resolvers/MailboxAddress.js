module.exports = {
  user: ({ address }, args, { loaders }) => {
    console.log(address)
    return loaders.User.byEmail.load(address)
  },
}
