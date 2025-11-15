// functions to track and manage user session sockets
const { logger } = require('@orbiting/backend-modules-logger')

const socketManagerLogger = logger.child({}, { msgPrefix: '[SocketManager] ' })

const socketStore = new Map()

function addSocket(sessionId, socket) {
  if (!socketStore.has(sessionId)) {
    socketManagerLogger.debug({ sessionId }, 'tracking new session')
    socketStore.set(sessionId, new Set())
  }
  socketManagerLogger.debug({ sessionId }, 'adding new socket to session')
  socketStore.get(sessionId).add(socket)
}

function removeSocket(sessionId, socket) {
  const connections = socketStore.get(sessionId)
  connections?.delete(socket)
  socketManagerLogger.debug({ sessionId }, 'removing socket from session')
  if (connections?.size === 0) {
    socketManagerLogger.debug({ sessionId }, 'removing session with no sockets')
    socketStore.delete(sessionId)
  }
}

function closeConnections(sessionId) {
  const connections = socketStore.get(sessionId)

  if (connections) {
    socketManagerLogger.debug({ sessionId }, 'removing all sockets for session')
    connections.forEach((socket) => {
      socket.close(4401, 'Session terminated')
    })
    socketManagerLogger.debug({ sessionId }, 'removing session')
    socketStore.delete(sessionId)
  }
}

module.exports = {
  addSocket,
  removeSocket,
  closeConnections,
}
