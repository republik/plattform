import { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node'

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {}

  console.log(
    'Create Single-line string field "Repo ID" (`repo_id`) in model "Artikel" (`challenge_accepted_article`)',
  )
  newFields['e766TPs3Qhq7koiVz5VVew'] = await client.fields.create('2314038', {
    label: 'Repo ID',
    field_type: 'string',
    api_key: 'repo_id',
    hint: 'Repo ID eines Beitrags, z.B. "republik/mein-super-text"',
    validators: { format: { custom_pattern: '^republik\\/[a-z0-9\\-]+$' } },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  })

  console.log(
    'Create Single-line string field "Query String" (`query_string`) in model "Artikel" (`challenge_accepted_article`)',
  )
  newFields['MKsj37lATE6YWxIblaLN9w'] = await client.fields.create('2314038', {
    label: 'Query String',
    field_type: 'string',
    api_key: 'query_string',
    validators: { format: { custom_pattern: '^\\?' } },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  })

  console.log(
    'Create Single-line string field "Repo ID" (`repo_id`) in model "Newsletter" (`challenge_accepted_newsletter`)',
  )
  newFields['RGWAGr_GQLGeypZBVNON7Q'] = await client.fields.create('2314039', {
    label: 'Repo ID',
    field_type: 'string',
    api_key: 'repo_id',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  })

  console.log('Update existing fields/fieldsets')

  console.log(
    'Update Single asset field "Override Image" (`image`) in model "Artikel" (`challenge_accepted_article`)',
  )
  await client.fields.update('12190314', { position: 4 })

  console.log(
    'Update Single-line string field "Path" (`path`) in model "Artikel" (`challenge_accepted_article`)',
  )
  await client.fields.update('12008201', {
    hint: 'DEPRECATED: Path of the article',
    validators: { unique: {}, format: { custom_pattern: '^\\/.+' } },
  })

  console.log(
    'Update Single-line string field "Path" (`path`) in model "Newsletter" (`challenge_accepted_newsletter`)',
  )
  await client.fields.update('12008209', {
    hint: 'DEPRECATED: Path of the newsletter (e.g. /2023/01/01/datocms-ist-super)',
    validators: { unique: {}, format: { custom_pattern: '^\\/.+' } },
  })

  console.log('Update model "Artikel" (`challenge_accepted_article`)')
  await client.itemTypes.update('2314038', {
    title_field: newFields['e766TPs3Qhq7koiVz5VVew'],
  })
}
