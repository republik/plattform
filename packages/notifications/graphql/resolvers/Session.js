module.exports = {
  device (session, args, { pgdb }) {
    return pgdb.public.devices.find({
      sessionId: session.sessionID
    })
  }
}
