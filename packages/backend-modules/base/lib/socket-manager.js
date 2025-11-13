// functions to track and manage user session sockets

const socketStore = new Map()

function addSocket(sessionId, socket) {
  if (!socketStore.has(sessionId)) {
    socketStore.set(sessionId, new Set())
  }
  socketStore.get(sessionId).add(socket)
}

function removeSocket(sessionId, socket) {
  const connections = socketStore.get(sessionId)
  connections?.delete(socket)
  if (connections?.size === 0) {
    socketStore.delete(sessionId)
  }
}

function closeConnections(sessionId) {
  const connections = socketStore.get(sessionId)

  if (connections) {
    connections.forEach((socket) => {
      socket.close(4401, 'Session terminated')
    })
    socketStore.delete(sessionId)
  }
}

module.exports = {
  addSocket,
  removeSocket,
  closeConnections,
}
