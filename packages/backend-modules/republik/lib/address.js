const MAX_ADDRESS_NAME_LENGTH = 70

const ensureStringLengthForAddress = (prop, maxLength, message, t) => {
  if (prop.length > maxLength) {
    throw new Error(t(message))
  }
}

const insertAddress = (address, pgdb, t) => {
  if (!address) {
    return
  }

  ensureStringLengthForAddress(
    address.name,
    MAX_ADDRESS_NAME_LENGTH,
    'address/name/tooLong',
    t,
  )

  const { id, ...input } = address
  return address && pgdb.public.addresses.insertAndGet(input)
}

const updateAddress = (address, pgdb, t) => {
  if (!address) {
    return
  }

  ensureStringLengthForAddress(
    address.name,
    MAX_ADDRESS_NAME_LENGTH,
    'address/name/tooLong',
    t,
  )

  return (
    address.id &&
    pgdb.public.addresses.updateAndGetOne(
      { id: address.id },
      { ...address, updatedAt: new Date() },
    )
  )
}

const upsertAddress = async (address, pgdb, t) => {
  return (
    (await updateAddress(address, pgdb, t)) ||
    (await insertAddress(address, pgdb, t))
  )
}

module.exports = {
  insertAddress,
  updateAddress,
  upsertAddress,
}
