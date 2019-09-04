
module.exports = (obj) =>
  Object.keys(obj).reduce(
    (agg, key) => {
      agg[obj[key]] = key
      return agg
    },
    {}
  )
