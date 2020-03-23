module.exports = {
  device (session, args, { pgdb }) {
    return pgdb.public.devices.findOne({
      sessionId: session.id
    })
  }
}
