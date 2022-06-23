const MAX_DEFAULT_LENGTH = 70
const MAX_CITY_LENGTH = 35

const ensureStringLengthForAddressProp = (prop, maxLength, message, t) => {
  if (prop?.length > maxLength) {
    throw new Error(t(message, { maxLength }))
  }
}

const insertAddress = (address, pgdb, t) => {
  if (!address) {
    return
  }

  ensureStringLengthForAddressProp(
    address.name,
    MAX_DEFAULT_LENGTH,
    'address/name/tooLong',
    t,
  )

  ensureStringLengthForAddressProp(
    address.line1,
    MAX_DEFAULT_LENGTH,
    'address/line1/tooLong',
    t,
  )

  ensureStringLengthForAddressProp(
    address.city,
    MAX_CITY_LENGTH,
    'address/city/tooLong',
    t,
  )

  const { id, ...input } = address
  return address && pgdb.public.addresses.insertAndGet(input)
}

const updateAddress = (address, pgdb, t) => {
  if (!address) {
    return
  }

  ensureStringLengthForAddressProp(
    address.name,
    MAX_DEFAULT_LENGTH,
    'address/name/tooLong',
    t,
  )

  ensureStringLengthForAddressProp(
    address.line1,
    MAX_DEFAULT_LENGTH,
    'address/line1/tooLong',
    t,
  )

  ensureStringLengthForAddressProp(
    address.city,
    MAX_CITY_LENGTH,
    'address/city/tooLong',
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
