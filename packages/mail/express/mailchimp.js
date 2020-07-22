const bodyParser = require('body-parser')
const moment = require('moment')

module.exports = async (server, pgdb) => {
  server.get(
    '/mail/mailchimp/webhook',
    (req, res) => res.sendStatus(204)
  )

  server.post(
    '/mail/mailchimp/webhook',
    bodyParser.urlencoded({ extended: true }),
    async (req, res) => {
      const { type, fired_at: firedAt, data } = req.body

      const record = {
        type,
        firedAt: moment(`${firedAt}+00:00`),
        createdAt: moment()
      }

      switch(type) {
        case 'subscribe':
          Object.assign(record, handleSubscribe(data))
          break
        case 'unsubscribe':
          Object.assign(record, handleUnsubscribe(data))
          break
        case 'profile':
          Object.assign(record, handleProfile(data))
          break
        case 'upemail':
          Object.assign(record, handleUpemail(data))
          break
        case 'cleaned':
          Object.assign(record, handleCleaned(data))
          break
      }

      await pgdb.public.mailchimpLog.insert(record)

      return res.sendStatus(204)
    }
  )
}

const handleSubscribe = data => {
  /*
  "data[id]": "8a25ff1d98",
  "data[list_id]": "a6b5da1054",
  "data[email]": "api@mailchimp.com",
  "data[email_type]": "html",
  "data[merges][EMAIL]": "api@mailchimp.com",
  "data[merges][FNAME]": "Mailchimp",
  "data[merges][LNAME]": "API",
  "data[merges][INTERESTS]": "Group1,Group2",
  "data[ip_opt]": "10.20.10.30",
  "data[ip_signup]": "10.20.10.30"
  */

  return {
    email: data.email,
    customer: getGroups('Customer', data),
    newsletter: getGroups('Republik NL', data)
  }
} 

const handleUnsubscribe = data => {
  /*
  "data[action]": "unsub",
  "data[reason]": "manual",
  "data[id]": "8a25ff1d98",
  "data[list_id]": "a6b5da1054",
  "data[email]": "api+unsub@mailchimp.com",
  "data[email_type]": "html",
  "data[merges][EMAIL]": "api+unsub@mailchimp.com",
  "data[merges][FNAME]": "Mailchimp",
  "data[merges][LNAME]": "API",
  "data[merges][INTERESTS]": "Group1,Group2",
  "data[ip_opt]": "10.20.10.30",
  "data[campaign_id]": "cb398d21d2"
  */
  return {
    email: data.email,
    action: data.action,
    reason: data.reason,
    customer: getGroups('Customer', data),
    newsletter: getGroups('Republik NL', data)
  }
}

const handleProfile = data => {
  /*
  "data[id]": "8a25ff1d98",
  "data[list_id]": "a6b5da1054",
  "data[email]": "api@mailchimp.com",
  "data[email_type]": "html",
  "data[merges][EMAIL]": "api@mailchimp.com",
  "data[merges][FNAME]": "Mailchimp",
  "data[merges][LNAME]": "API",
  "data[merges][INTERESTS]": "Group1,Group2",
  "data[ip_opt]": "10.20.10.30"
  */
  return {
    customer: getGroups('Customer', data),
    newsletter: getGroups('Republik NL', data)
  }
}

const handleUpemail = data => {
  /*
  "data[list_id]": "a6b5da1054",
  "data[new_id]": "51da8c3259",
  "data[new_email]": "api+new@mailchimp.com",
  "data[old_email]": "api+old@mailchimp.com"
  */
  return {
    email: data['new_email'],
    oldEmail: data['old_email']
  }
}

const handleCleaned = data => {
  /*
  "data[list_id]": "a6b5da1054",
  "data[campaign_id]": "4fjk2ma9xd",
  "data[reason]": "hard",
  "data[email]": "api+cleaned@mailchimp.com"
  */
  return {
    email: data.email,
    reason: data.reason
  }
}

/**
 * Finds a grouping by {name} in an array with objects, splits
 * {groups} string and returns an array.
 * 
 * @example: getGroups(
 *  'Customer', [
 *    {
 *      id: 'r',
 *      unique_id: 'r',
 *      name: 'Customer',
 *      groups: 'Pledger, Member'
 *    },
 *    ...
 *  ]
 * )
 *
 * results in:
 *  [ "Pledger", "Member" ]
 *
 */
const getGroups = (name, data) => {
  const groupings = data?.merges?.GROUPINGS

  if (!groupings && !groupings.length) {
    return
  }

  const grouping = groupings.find(g => g.name === name)

  return grouping.groups.split(',').map(g => g.trim()).filter(Boolean)
}