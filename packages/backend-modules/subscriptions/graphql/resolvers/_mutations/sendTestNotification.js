// No-op: test notifications went through publikator's repo based notifyPublish
// and the discussions submitComment notifier. Publish notifications are handled
// by Sanity now. The field stays in the schema so the API doesn't break.
module.exports = async () => false
