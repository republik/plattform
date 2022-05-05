class JWTInvalidException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JWTInvalidException'
  }
}

export default JWTInvalidException
