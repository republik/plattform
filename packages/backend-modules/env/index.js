const path = require('path')

const DEV = process.env.NODE_ENV !== 'production'
const OVERWRITE_ENV = process.env.OVERWRITE_ENV

const config = (envFile) => {
  if (DEV) {
    const dotenv = require('dotenv')
    const paths = new Set()

    if (OVERWRITE_ENV) {
      paths.add(OVERWRITE_ENV)
    }

    if (envFile) {
      paths.add(getPath(envFile))
    }

    paths.add(getPath('apps/api/.env'))

    Array.from(paths).forEach((path) => dotenv.config({ path }))

    return { paths }
  }
}

const getPath = (envFile = '.env') => path.join(__dirname, '../../..', envFile)

module.exports = {
  config,
}
