const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true

const config = (options) => {
  if (DEV) {
    const dotenv = require('dotenv')
    dotenv.config({path: process.env.OVERWRITE_ENV})
    if (options && options.testing) {
      dotenv.config({path: './.test.env'})
      dotenv.config({path: '../../.test.env'})
    } else {
      dotenv.config()
      dotenv.config({path: '../../.env'})
    }
  }
}

module.exports = {
  config
}
