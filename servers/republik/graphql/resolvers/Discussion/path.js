module.exports = async ({ path, documentPath }, _, { pgdb, user }) => {
  return path || documentPath
}
