const insertAddress = (address, pgdb) => {
  if (!address) {
    return
  }

  const { id, ...input } = address
  return address && pgdb.public.addresses.insertAndGet(input)
}

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

const upsertAddress = async (address, pgdb) => {
  return (
    (await updateAddress(address, pgdb)) || (await insertAddress(address, pgdb))
  )
}

module.exports = {
  insertAddress,
  updateAddress,
  upsertAddress,
}
