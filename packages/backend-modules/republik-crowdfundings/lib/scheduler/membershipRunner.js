require('@orbiting/backend-modules-env').config()

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const { t } = require('@orbiting/backend-modules-translate')
const mail = require('@orbiting/backend-modules-republik-crowdfundings/lib/Mail')
const { loaderBuilders } = require('@orbiting/api-app/server')

const { run: membershipsOwnersHandler } = require('./owners')
const { changeover } = require('./changeover')

const applicationName = ['backends', 'runner', process.env.DYNO, 'scheduler']
  .filter(Boolean)
  .join(' ')

ConnectionContext.create(applicationName).then(async (connectionContext) => {
  const createGraphQLContext = async (defaultContext) => {
    const loaders = {}
    const context = {
      ...defaultContext,
      ...connectionContext,
      t,
      mail,
      loaders,
    }
    Object.keys(loaderBuilders).forEach((key) => {
      loaders[key] = loaderBuilders[key](context)
    })
    return context
  }

  const context = await createGraphQLContext({ scope: 'scheduler' })

  await changeover({}, context)
  await membershipsOwnersHandler({}, context)

  await ConnectionContext.close(context)
})
