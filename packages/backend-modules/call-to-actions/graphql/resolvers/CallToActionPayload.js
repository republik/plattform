module.exports = {
  __resolveType: (payload, args, context) => {
    if (payload.customComponent) {
      return 'CallToActionComponentPayload'
    }

    return 'CallToActionBasicPayload'
  },
}
