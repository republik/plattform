import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Handlebars from 'handlebars'

const TEMPLATE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)))

export const pkgJsonTmpl = Handlebars.compile(
  fs.readFileSync(path.join(TEMPLATE_DIR, 'package.json.hbs')).toString(),
  {
    noEscape: true,
  },
)
export const tsConfJsonTmpl = Handlebars.compile(
  fs.readFileSync(path.join(TEMPLATE_DIR, 'tsconfig.json.hbs')).toString(),
)
export const gqlSchmeaTmpl = Handlebars.compile(
  fs
    .readFileSync(path.join(TEMPLATE_DIR, 'graphql', 'schema.ts.hbs'))
    .toString(),
)
export const gqlSchemaTypesTmpl = Handlebars.compile(
  fs
    .readFileSync(path.join(TEMPLATE_DIR, 'graphql', 'schema-types.ts.hbs'))
    .toString(),
)
export const gqlIndexTmpl = Handlebars.compile(
  fs
    .readFileSync(path.join(TEMPLATE_DIR, 'graphql', 'index.ts.hbs'))
    .toString(),
)
export const indexTmpl = Handlebars.compile(
  fs.readFileSync(path.join(TEMPLATE_DIR, 'index.ts.hbs')).toString(),
)
