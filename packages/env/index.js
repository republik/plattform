const path = require('path')

const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true

const config = (envFile) => {
  if (DEV) {
    const dotenv = require('dotenv')

    // only required by asset server
    dotenv.config()

    const projectRootPath = path.join(
      __dirname, '../..'
    )
    if (envFile) {
      dotenv.config({ path: path.join(projectRootPath, envFile) })
    }
    dotenv.config({ path: path.join(projectRootPath, '.env') })
  }
}

module.exports = {
  config
}
