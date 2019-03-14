const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true

const config = (path) => {
  if (DEV) {
    const dotenv = require('dotenv')
    if (path) {
      dotenv.config({path})
    }
    dotenv.config({path: process.env.OVERWRITE_ENV})
    dotenv.config()
    dotenv.config({path: '../../.env'})
  }
}

module.exports = {
  config
}
