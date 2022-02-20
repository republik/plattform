const isNewsletterReferer = (ref) => ref?.startsWith('republik/')

const normalizeCampagneName = (name, customNewsletters = []) => {
  if (name) {
    if (name.startsWith('pocket-newtab')) {
      return 'Pocket'
    }
    if (name.startsWith('ta_dermorgen_')) {
      return 'Tagi-Newsletter: Der Morgen'
    }
    if (isNewsletterReferer(name)) {
      const customNewsletter = customNewsletters.find(({ values }) =>
        values.includes(name),
      )
      if (customNewsletter) {
        return customNewsletter.name
      }
      return 'Republik-Newsletter'
    }
  }
  return `Kampagne ${name || 'Unbekannt'}`
}

const referrerNames = {
  'pinterest.com': 'Pinterest',
  'youtube.com': 'YouTube',
  'com.stefandekanski.hackernews.free': 'Hacker News',
  'away.vk.com': 'Vkontakte',
  'github.com': 'GitHub',
  'reddit.com': 'reddit',
  'old.reddit.com': 'reddit',
  'org.telegram.messenger': 'Telegram',
  instagram: 'Instagram',
  'instagram.com': 'Instagram',
  'xing.com': 'XING',
  'com.xing.android': 'XING',
  'linkedin.com': 'LinkedIn',
  'com.linkedin.android': 'LinkedIn',
  'com.slack': 'Slack',
  'lm.facebook.com': 'Facebook',
  'facebook.com': 'Facebook',
  't.co': 'Twitter',
  'twitter.com': 'Twitter',
  'mobile.twitter.com': 'Twitter',
  'com.twitter.android': 'Twitter',
  'com.samruston.twitter': 'Twitter',
  'tweetdeck.twitter.com': 'Twitter',
  'getpocket.com': 'Pocket',
  'daily.spiegel.de': 'spiegel.de',
  'en.m.wikipedia.org': 'Wikipedia',
  'en.wikipedia.org': 'Wikipedia',
  'de.m.wikipedia.org': 'Wikipedia',
  'de.wikipedia.org': 'Wikipedia',
  'com.google.android.gm': 'GMail Android App',
  'webmail2.sunrise.ch': 'Webmail',
  'deref-gmx.net': 'Webmail',
  'deref-web-02.de': 'Webmail',
  'rich-v01.bluewin.ch': 'Webmail',
  'rich-v02.bluewin.ch': 'Webmail',
  'mail.yahoo.com': 'Webmail',
  'outlook.live.com': 'Webmail',
  'webmail1.sunrise.ch': 'Webmail',
  'office.hostpoint.ch': 'Webmail',
  'mail.zhaw.ch': 'Webmail',
  'mail.google.com': 'Webmail',
  'idlmail04.lotus.uzh.ch': 'Webmail',
  'com.google.android.googlequicksearchbox': 'Google',
}
const normalizeReferrerName = (input) => {
  let name = input
  if (name.match(/\.cdn\.ampproject\.org$/)) {
    name = name.replace(/\.cdn\.ampproject\.org$/, '').replace('-', '.')
  }
  name = name.replace(/^(www|m|l|amp)\./, '').replace(/-ch$/, '.ch')
  return referrerNames[name] || name
}

module.exports = {
  isNewsletterReferer,
  normalizeCampagneName,
  normalizeReferrerName,
}
