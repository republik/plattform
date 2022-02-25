module.exports = {
  label: ({ key }, args, { t }) => {
    return t(`api/republik/revenueStats/segment/${key}`, null, key)
  },
}
