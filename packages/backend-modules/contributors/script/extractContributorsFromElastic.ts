import yargs from 'yargs'

async function main(argv) {

}

const argv = yargs
  .option('xxx', {
    alias: 'b',
    type: 'string',
  }).argv

main(argv)
