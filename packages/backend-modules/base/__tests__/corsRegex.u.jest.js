const express = require('express')
const request = require('supertest')
const { faker } = require('@faker-js/faker')
const cors = require('cors')
const { createCORSMatcher } = require('../lib/corsRegex.js')

function makeServerWithCorsList(corsList) {
  const app = express()
  app.use(
    cors({
      credentials: true,
      // maxAge: <seconds>; up to 24 hours
      // @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
      maxAge: 60 * 60 * 24,
      optionsSuccessStatus: 200,
      origin: createCORSMatcher(corsList),
    }),
  )
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'Success' })
  })
  return app
}

const corsList = [
  'http://www.republik.ch',
  'http://www.republik.love',
  'http://republik.test',
  'http://www.republik.test',
  'http://api.republik.test',
  'http://*.preview.republik.test',
  'http://*.republik.local',
]

const expectedToPass = [
  'http://localhost',
  'http://localhost:3010',
  'https://localhost:3010',
  'http://www.republik.ch',
  'http://www.republik.love',
  'http://republik.test',
  'http://www.republik.test',
  'http://api.republik.test',
  'http://foo.republik.local',
  'http://foo.bar.republik.local',
  'http://foo.bar.baz.republik.local',
]

const expectedPreviewDomainsToPass = [
  `http://${faker.internet.domainWord()}.preview.republik.test`,
  `http://${faker.internet.domainWord()}.preview.republik.test`,
  `http://${faker.internet.domainWord()}.preview.republik.test`,
  `http://${faker.internet.domainWord()}.preview.republik.test`,
]

const expectedToFail = [
  `http://localhost.republik.test`,
  `http://localhost.example.com/`,
  `http://localhost.republik.test/`,
  `http://sub.localhost.republik.test`,
  `http://sub.localhost.example.com/`,
  `http://127.0.0.1.example.com/`,
  `http://sub.127.0.0.1.example.com/`,
  'http://localhostrepublik.test',
  'http://localhostexample.com',
  `http://${faker.internet.domainWord()}.republik.test`,
  `http://${faker.internet.domainWord()}.republik.test`,
  `http://${faker.internet.domainWord()}.republik.test`,
  `http://${faker.internet.domainWord()}.republik.test`,
]

describe('custom cors regex domain support', () => {
  const server = makeServerWithCorsList(corsList)

  for (const origin of expectedToPass) {
    test(`✅ - origin '${origin}' is allowed with cors-list '[${corsList}]'`, async () => {
      const res = await request(server).get('/').set('origin', origin)

      expect(res.status).toEqual(200)
      expect(res.body.message).toEqual('Success')
    })
  }

  for (const origin of expectedPreviewDomainsToPass) {
    test(`✅ - preview origin '${origin}' is allowed with cors-list '[${corsList}]'`, async () => {
      const res = await request(server).get('/').set('origin', origin)

      expect(res.status).toEqual(200)
      expect(res.body.message).toEqual('Success')
    })
  }

  for (const origin of expectedToFail) {
    test(`🛑 - origin '${origin}' is denied with cors-list '[${corsList}]'`, async () => {
      const res = await request(server).get('/').set('origin', origin)

      expect(res.status).toEqual(500)
    })
  }
})
