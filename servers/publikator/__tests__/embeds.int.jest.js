const { Instance } = require('@orbiting/backend-modules-test')

beforeAll(async () => {
  await Instance.init({ serverName: 'publikator' })
}, 60000)

afterAll(async () => {
  await global.instance.closeAndCleanup()
}, 60000)

describe('embeds unauthorized', () => {
  test('fetch youtube data with unathorized user', async () => {
    const { apolloFetch, context: { t } } = global.instance
    const result = await apolloFetch({
      query: `
        {
          embed(id: "2-------ds8", embedType: YoutubeEmbed) {
            __typename
            ... on YoutubeEmbed {
              id
              userName
            }
          }
        }
      `
    })
    expect(result.errors[0].message).toBe(t('api/signIn'))
  })

  test('fetch vimeo data with unathorized user', async () => {
    const { apolloFetch, context: { t } } = global.instance
    const result = await apolloFetch({
      query: `
        {
          embed(id: "200000017", embedType: VimeoEmbed) {
            __typename
            ... on VimeoEmbed {
              id
              userName
            }
          }
        }
      `
    })
    expect(result.errors[0].message).toBe(t('api/signIn'))
  })

  test('fetch twitter data with unathorized user', async () => {
    const { apolloFetch, context: { t } } = global.instance
    const result = await apolloFetch({
      query: `
        {
          embed(id: "900000000009366656", embedType: TwitterEmbed) {
            __typename
            ... on TwitterEmbed {
              id
              text
              userName
            }
          }
        }
      `
    })
    expect(result.errors[0].message).toBe(t('api/signIn'))
  })

  test('fetch documentcloud data with unathorized user', async () => {
    const { apolloFetch, context: { t } } = global.instance
    const result = await apolloFetch({
      query: `
        {
          embed(id: "325931", embedType: DocumentCloudEmbed) {
            __typename
            ... on DocumentCloudEmbed {
              id
              title
              thumbnail
              contributorName
            }
          }
        }
      `
    })
    expect(result.errors[0].message).toBe(t('api/signIn'))
  })
})

describe('embeds authorized', () => {
  beforeEach(() => {
    global.testUser = {
      email: 'alice.smith@test.project-r.construction',
      roles: [ 'editor' ]
    }
  })

  afterEach(() => {
    global.testUser = null
  })

  test('fetch youtube data', async () => {
    const result = await global.instance.apolloFetch({
      query: `
        {
          embed(id: "2lXD0vv-ds8", embedType: YoutubeEmbed) {
            __typename
            ... on YoutubeEmbed {
              id
              userName
            }
          }
        }
      `
    })

    expect(result.data.embed).toEqual({
      __typename: 'YoutubeEmbed',
      id: '2lXD0vv-ds8',
      userName: 'FlyingLotusVEVO'
    })
  }, 30000)

  test('fetch youtube data with invalid id', async () => {
    const result = await global.instance.apolloFetch({
      query: `
        {
          embed(id: "2-------ds8", embedType: YoutubeEmbed) {
            __typename
            ... on YoutubeEmbed {
              id
              userName
            }
          }
        }
      `
    })
    expect(result.errors[0].message).toBe(
      'Youtube API Error: No video found with ID 2-------ds8.'
    )
  }, 30000)

  test('fetch vimeo data', async () => {
    const result = await global.instance.apolloFetch({
      query: `
        {
          embed(id: "229537127", embedType: VimeoEmbed) {
            __typename
            ... on VimeoEmbed {
              id
              userName
            }
          }
        }
      `
    })
    expect(result.data.embed).toEqual({
      __typename: 'VimeoEmbed',
      id: '229537127',
      userName: 'FutureDeluxe'
    })
  }, 30000)

  test('fetch vimeo data with invalid id', async () => {
    const result = await global.instance.apolloFetch({
      query: `
        {
          embed(id: "200000017", embedType: VimeoEmbed) {
            __typename
            ... on VimeoEmbed {
              id
              userName
            }
          }
        }
      `
    })
    expect(result.errors[0].message).toBe(
      "Vimeo API Error: The requested video couldn't be found.."
    )
  }, 30000)

  test('fetch twitter data', async () => {
    const result = await global.instance.apolloFetch({
      query: `
        {
          embed(id: "931088218279366656", embedType: TwitterEmbed) {
            __typename
            ... on TwitterEmbed {
              id
              text
              userName
            }
          }
        }
      `
    })
    expect(result.data.embed).toEqual({
      __typename: 'TwitterEmbed',
      id: '931088218279366656',
      text: 'What’s the manager’s message to the fans ahead of #AFCvTHFC?\n\n“Just to support the team and stand with us for the 90 minutes”\n\n#WeAreTheArsenal🔴 https://t.co/GQM6lFfcVr',
      userName: 'Arsenal'
    })
  }, 30000)

  test('fetch twitter data with invalid id', async () => {
    const result = await global.instance.apolloFetch({
      query: `
        {
          embed(id: "900000000009366656", embedType: TwitterEmbed) {
            __typename
            ... on TwitterEmbed {
              id
              text
              userName
            }
          }
        }
      `
    })
    expect(result.errors[0].message).toBe(
      'Twitter API Errors: 144: No status found with that ID.'
    )
  }, 30000)

  test('fetch documentcloud data', async () => {
    const result = await global.instance.apolloFetch({
      query: `
        {
          embed(id: "325931", embedType: DocumentCloudEmbed) {
            __typename
            ... on DocumentCloudEmbed {
              id
              title
              thumbnail
              contributorName
            }
          }
        }
      `
    })
    expect(result.data.embed.__typename).toBe('DocumentCloudEmbed')
    expect(result.data.embed.id).toBe('325931')
    expect(result.data.embed.title).toBeTruthy()
    expect(result.data.embed.thumbnail).toBeTruthy()
    expect(result.data.embed.contributorName).toBeTruthy()
  }, 30000)
})
