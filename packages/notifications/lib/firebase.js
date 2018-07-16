// https://firebase.google.com/docs/cloud-messaging/admin/legacy-fcm?authuser=1
// https://firebase.google.com/docs/cloud-messaging/admin/send-messages?authuser=1#defining_the_message
// https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html

const firebase = require('firebase-admin')
const debug = require('debug')('notifications:publish:firebase')

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_DATABASE_URL
} = process.env

// singleton
firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY
      .replace(/@/g, '\n')
      .replace(/\\\s/g, ' ')
  }),
  databaseURL: FIREBASE_DATABASE_URL
})

const publish = async (args) => {
  const { tokens, title, body, url, icon, type, ttl, priority } = args

  if (tokens.length > 0) {
    const message = {
      notification: {
        title,
        body
      },
      data: {
        url,
        type,
        ...icon
          ? { icon }
          : {}
      }
    }
    const options = {
      ...ttl ? { timeToLive: parseInt(ttl / 1000.0) } : {},
      ...priority ? { priority } : {}
    }
    const result = await firebase.messaging().sendToDevice(
      tokens,
      message,
      options
    )
    debug('#recipients %d, message: %O, result: %O', tokens.length, message, result)
  } else {
    debug('no receipients found for publish: %O', args)
  }
}

module.exports = {
  publish
}
