export const matchSubscriptions = (names: string[], subscriptions) =>
  names.map((name) => subscriptions.find((s) => s?.name === name))

export const isSubscribed = (name: string, subscriptions) =>
  subscriptions?.find((s) => s?.name === name)
