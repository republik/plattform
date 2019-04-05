const path = require('path')

const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true

const config = (envPath) => {
  if (DEV) {
    const dotenv = require('dotenv')
    if (envPath) {
      dotenv.config({ path: envPath })
    }
    dotenv.config({ path: process.env.OVERWRITE_ENV })
    dotenv.config()
    if (envPath) {
      dotenv.config({ path:
        path.join(path.dirname(envPath), '../..', path.basename(envPath))
      })
    } else {
      dotenv.config({ path: '../../.env' })
    }
  }
}

module.exports = {
  config
}
