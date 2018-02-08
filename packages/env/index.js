const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true

const config = () => {
  if (DEV) {
    const dotenv = require('dotenv')
    dotenv.config({path: process.env.OVERWRITE_ENV})
    dotenv.config()
    dotenv.config({path: '../../.env'})
  }
}

module.exports = {
  config
}
