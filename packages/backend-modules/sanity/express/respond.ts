// The failure body every studio-facing handler in this module replies with —
// studio's Blueprint Functions read `success`/`error` off it.
export const errorBody = (message: string) => ({
  success: false,
  error: message,
})
