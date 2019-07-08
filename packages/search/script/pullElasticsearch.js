require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')

const mappings = require('../lib/indices')
const pullElasticsearch = require('../lib/pullElasticsearch')

const argv = yargs
  .option('indices', {
    description: 'Indices to populate',
    alias: ['i', 'index'],
    array: true,
    choices: mappings.list.map(({ name }) => name)
  })
  .option('switch', {
    description: 'Create and switch to new indices',
    alias: 's',
    boolean: true,
    default: true
  })
  .option('search', {
    descripton: 'Apply search term filter',
    string: true
  })
  .option('inserts', {
    descripton: 'Insert data',
    boolean: true,
    default: true
  })
  .option('flush', {
    description: 'Remove unused indices',
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
