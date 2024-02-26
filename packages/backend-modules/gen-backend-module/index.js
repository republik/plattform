#!/usr/bin/env node
import yargs from 'yargs/yargs'
import fs from 'node:fs'
import path from 'node:path'
import {
  gqlIndexTmpl,
  gqlSchemaTypesTmpl,
  gqlSchmeaTmpl,
  indexTmpl,
  pkgJsonTmpl,
  tsConfJsonTmpl,
} from './templates/template.js'

const BACKEND_MOD_PATH = path.join(process.cwd(), 'packages', 'backend-modules')

function exit(reason) {
  console.error(reason)
  process.exit(1)
}

function genBackendModule(argv) {
  const modName = argv.name
  const modPath = path.join(BACKEND_MOD_PATH, modName)

  if (fs.existsSync(modPath)) {
    exit(`Module ${modName} already exits`)
  }

  console.log(
    `Generating module ${argv.name} in ${path.join(
      'packages',
      'backend-modules',
    )} by ${argv.author}`,
  )

  console.log('creating module directory')
  fs.mkdirSync(modPath)

  console.log('creating sub directories')
  for (const p of [
    'lib',
    'graphql',
    'graphql/resolvers/_queries',
    'graphql/resolvers/_mutations',
  ]) {
    fs.mkdirSync(path.join(modPath, p), {
      recursive: true,
    })
  }

  fs.writeFileSync(path.join(modPath, '.gitignore'), 'build\nbuild/*\n')

  console.log('creating package.json')
  fs.writeFileSync(
    path.join(modPath, 'package.json'),
    pkgJsonTmpl({
      name: modName,
      author: argv.author || '',
    }),
  )

  console.log('creating tsconfig.json')
  fs.writeFileSync(path.join(modPath, 'tsconfig.json'), tsConfJsonTmpl(null))

  console.log('creating index.ts')
  fs.writeFileSync(path.join(modPath, 'index.ts'), indexTmpl(null))

  console.log('creating graphql files...')
  fs.writeFileSync(
    path.join(modPath, 'graphql', 'index.ts'),
    gqlIndexTmpl(null),
  )
  fs.writeFileSync(
    path.join(modPath, 'graphql', 'schema.ts'),
    gqlSchmeaTmpl(null),
  )
  fs.writeFileSync(
    path.join(modPath, 'graphql', 'schema-types.ts'),
    gqlSchemaTypesTmpl(null),
  )

  console.log('WUP WUP module is ready')
}

yargs(process.argv.slice(2))
  .usage('$0 <cmd> [args]')
  .command({
    command: 'new backend-module [name]',
    aliases: ['new bm'],
    builder: (yargs) =>
      yargs.required('name', 'module name is required').options('author', {
        alias: ['a'],
      }),
    handler: genBackendModule,
  })
  .demandCommand(1)
  .help()
  .parse()
