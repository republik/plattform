const getAddress = ({ name, address }) => ({
  id: address,
  address,
  name,
})

const getAddresses = (values) =>
  values?.filter(({ address }) => !!address).map(getAddress)

module.exports = {
  getAddress,
  getAddresses,
}
