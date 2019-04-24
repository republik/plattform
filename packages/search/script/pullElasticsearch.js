require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')

const mappings = require('../lib/indices')
const pullElasticsearch = require('../lib/pullElasticsearch')

const argv = yargs
  .option('indices', {
    alias: ['i', 'index'],
    array: true,
    choices: mappings.list.map(({ name }) => name)
  })
  .option('switch', {
    alias: 's',
    boolean: true,
    default: true
  })
  .option('inserts', {
    boolean: true,
    default: true
  })
  .option('flush', {
    boolean: true,
    default: false
  })
  .help()
  .version()
  .argv

pullElasticsearch(argv)
  .then(() => {
    process.exit()
  }).catch(e => {
    console.log(e)
    process.exit(1)
  })
