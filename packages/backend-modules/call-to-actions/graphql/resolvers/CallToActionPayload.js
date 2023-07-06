module.exports = {
  __resolveType: (cta, args, context) => {
    if (cta.customComponent) {
      return 'CallToActionComponentPayload'
    }

    return 'CallToActionBasicPayload'
  },
}
