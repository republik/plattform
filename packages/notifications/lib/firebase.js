const admin = require('firebase-admin')

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_DATABASE_URL
} = process.env

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY
      .replace(/@/g, '\n')
      .replace(/\\\s/g, ' ')
  }),
  databaseURL: FIREBASE_DATABASE_URL
})

module.exports = admin
