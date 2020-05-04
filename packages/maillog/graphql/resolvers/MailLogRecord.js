const moment = require('moment')

const { Roles } = require('@orbiting/backend-modules-auth')

const { getTemplate, getSubject, getStatus, getError } = require('../../lib/record')

module.exports = {
  template: getTemplate,
  subject: getSubject,
  status: getStatus,
  error: getError,
  user: async (record, args, { loaders }) => loaders.User.byIdOrEmail.load(record.userId || record.email),
  mandrill: (record, args, { user: me }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter'])) {
      return null
    }

    return [
      record.createdAt > moment().subtract(30, 'days') && record.result && record.result._id && {
        label: 'View Content',
        url: [
          'https://mandrillapp.com/activity/content?id=',
          moment(record.createdAt).format('YYYYMMDD'),
          '_',
          record.result._id
        ].join('')
      },
      {
        label: 'Check Blacklist',
        url: `https://mandrillapp.com/settings/rejections?q=${record.email}`
      }
    ].filter(Boolean)
  }
}
