import { postMessage } from '../withInNativeApp'

function notifyApp<T = unknown>(type: string, data?: T) {
  return postMessage({
    type,
    payload: data,
  })
}

export default notifyApp
