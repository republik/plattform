const updateAddress = (address, pgdb) => {
  if (!address) {
    return
  }

  return (
    address.id &&
    pgdb.public.addresses.updateAndGetOne(
      { id: address.id },
      { ...address, updatedAt: new Date() },
    )
  )
}

module.exports = {
  updateAddress,
}
