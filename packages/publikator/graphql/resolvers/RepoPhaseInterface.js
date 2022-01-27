module.exports = {
  label(obj, args, context) {
    return context.t(`api/repo/phase/${obj.key}`)
  },
}
