module.exports = {
  user: ({ address }, args, { loaders }) => loaders.User.byEmail.load(address),
}
