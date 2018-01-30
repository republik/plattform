module.exports = class AuthError extends Error {
  constructor (type, meta) {
    console.log(meta)
    const message = `auth exception: ${type} ${JSON.stringify(meta)}`
    super(message)
    this.type = type
    this.meta = meta
  }
}
