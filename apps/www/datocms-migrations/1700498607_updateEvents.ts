import { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node'

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets')

  console.log(
    'Create Single-line string field "Link zum Ort" (`location_link`) in model "Veranstaltung" (`event`)',
  )
  await client.fields.create('2314077', {
    id: 'GkBolDwGQjWmPYX9dTRKkw',
    label: 'Link zum Ort',
    field_type: 'string',
    api_key: 'location_link',
    validators: { format: { predefined_pattern: 'url' } },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
    fieldset: { id: '846380', type: 'fieldset' },
  })

  console.log(
    'Update Single-line string field "Link zum Ort" (`location_link`) in model "Veranstaltung" (`event`)',
  )
  await client.fields.update('GkBolDwGQjWmPYX9dTRKkw', { position: 1 })

  console.log(
    'Update Boolean field "Beschr\u00E4nkt auf Verleger:innen" (`members_only`) in model "Veranstaltung" (`event`)',
  )
  await client.fields.update('12190044', {
    label: 'Beschr\u00E4nkt auf Verleger:innen',
    api_key: 'members_only',
    hint: null,
    position: 2,
    appearance: {
      addons: [
        {
          id: '152893',
          parameters: { invert: false, targetFieldsApiKey: ['non_member_cta'] },
          field_extension: 'conditionalFields',
        },
      ],
      editor: 'boolean',
      parameters: {},
    },
  })

  console.log(
    'Update Structured text field "Beschreibung" (`description`) in model "Veranstaltung" (`event`)',
  )
  await client.fields.update('12008205', {
    validators: {
      required: {},
      structured_text_blocks: { item_types: [] },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [],
      },
    },
    appearance: {
      addons: [],
      editor: 'structured_text',
      parameters: {
        marks: [
          'strong',
          'code',
          'emphasis',
          'underline',
          'strikethrough',
          'highlight',
        ],
        nodes: ['heading', 'link', 'list'],
        heading_levels: [3, 4, 5, 6],
        blocks_start_collapsed: false,
        show_links_meta_editor: false,
        show_links_target_blank: true,
      },
    },
  })

  console.log(
    'Update Structured text field "Call To Action f\u00FCr Nicht-Verleger:innen" (`non_member_cta`) in model "Veranstaltung" (`event`)',
  )
  await client.fields.update('12290620', {
    label: 'Call To Action f\u00FCr Nicht-Verleger:innen',
    appearance: {
      addons: [],
      editor: 'structured_text',
      parameters: {
        marks: ['strong', 'emphasis'],
        nodes: ['link'],
        heading_levels: [1, 2, 3, 4, 5, 6],
        blocks_start_collapsed: false,
        show_links_meta_editor: false,
        show_links_target_blank: true,
      },
    },
  })

  console.log('Manage menu items')

  console.log('Update menu item "Veranstaltungen"')
  await client.menuItems.update('1335764', { label: 'Veranstaltungen' })
}
