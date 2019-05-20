const deleteSessionForDevices = async (tokens, pgdb) => {
  console.log(`TEST-deleteSessionForDevices length: ${tokens.length}`, tokens)
  /*
  return pgdb.query(`
    DELETE FROM sessions s WHERE s.id IN (
      SELECT d."sessionId" FROM devices d WHERE ARRAY[d.token] && :tokens
    )
  `, {tokens})
  */
}

module.exports = {
  deleteSessionForDevices
}
