const { PublicationWorker } = require('./workers/PublicationWorker')
const {
  PublicationNotificationWorker,
} = require('./workers/PublicationNotificationWorker')

module.exports = {
  PublicationWorker,
  PublicationNotificationWorker,
}
