// https://firebase.google.com/docs/cloud-messaging/admin/legacy-fcm?authuser=1
// https://firebase.google.com/docs/cloud-messaging/admin/send-messages?authuser=1#defining_the_message

const { chunk } = require('lodash')
const debug = require('debug')('notifications:publish:firebase')
const firebase = require('firebase-admin')
const Promise = require('bluebird')

const { deleteSessionForDevices } = require('./utils')

const {
  SEND_NOTIFICATIONS,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_DATABASE_URL,
} = process.env

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

let initialized
if (
  !FIREBASE_PROJECT_ID ||
  !FIREBASE_CLIENT_EMAIL ||
  !FIREBASE_PRIVATE_KEY ||
  !FIREBASE_DATABASE_URL
) {
  console.warn(
    'missing env FIREBASE_*, sending push notifications via firebase will not work',
  )
} else {
  // singleton
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/@/g, '\n').replace(
        /\\\s/g,
        ' ',
      ),
    }),
    databaseURL: FIREBASE_DATABASE_URL,
  })
  initialized = true
}

const publish = async (args, pgdb) => {
  if (
    SEND_NOTIFICATIONS === 'false' ||
    (DEV && SEND_NOTIFICATIONS !== 'true')
  ) {
    console.log(
      '\n\nSEND_NOTIFICATIONS prevented notification from being sent\n(SEND_NOTIFICATIONS == false or NODE_ENV != production and SEND_NOTIFICATIONS != true)\n',
      args,
    )
    return
  }
  if (!initialized) {
    throw new Error("mssing env FIREBASE_*, can't publish")
  }

  const { tokens, title, body, url, icon, type, ttl, priority } = args

  if (tokens.length > 0) {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        url,
        type,
        ...(icon ? { icon } : {}),
      },
    }
    const options = {
      ...(ttl ? { timeToLive: parseInt(ttl / 1000) } : {}),
      ...(priority ? { priority } : {}),
    }

    const result = await Promise.mapSeries(
      chunk(tokens, 1000),
      async (tokensChunk) => {
        /*
          @see https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.messagingdevicesresponse
          response = {
            results: [ { messageId: '123' } ], @see https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.messagingdeviceresult
            canonicalRegistrationTokenCount: 0,
            failureCount: 0,
            successCount: 1,
            multicastId: 157195303459347400
          }
        */
        const response = await firebase
          .messaging()
          .sendToDevice(tokensChunk, message, options)

        debug(
          'Firebase: #recipients %d, message: %O, response: %O',
          tokensChunk.length,
          message,
          response,
        )

        return response.results
      },
    ).then((chunkResults) => chunkResults.flat())

    const staleTokens = result.reduce((acc, cur, idx) => {
      if (
        cur.error &&
        cur.error.code === 'messaging/registration-token-not-registered'
      ) {
        acc.push(tokens[idx])
      }
      return acc
    }, [])
    if (staleTokens.length > 0) {
      await deleteSessionForDevices(staleTokens, pgdb)
      debug('deleted sessions for stale firebase device tokens', staleTokens)
    }
    return {
      staleTokens,
      goodTokens: tokens.filter((t) => staleTokens.indexOf(t) === -1),
    }
  } else {
    debug('no receipients found for publish: %O', args)
  }
}

module.exports = {
  publish,
}
