import LightSwitch from '@app/components/lightswitch'
import { getMe } from '@app/lib/auth/me'
import { getPlatformInformation } from '@app/lib/util/useragent/platform-information'
import { css } from '@republik/theme/css'
import { vstack } from '@republik/theme/patterns'
import {
  IconInstagram,
  IconLogoFacebook,
  IconLogoMastodon,
  IconLogoBluesky,
  IconOpensource,
} from '@republik/icons'
import { PUBLIC_BASE_URL } from 'lib/constants'
import Link, { LinkProps } from 'next/link'
import { ComponentType, ReactElement, isValidElement } from 'react'
import { UrlObject } from 'url'
import logo from '@republik/theme/logo.json'

/**
 * isLinkOfSameHost checks if a link is of the same host as the host provided.
 * @param link relative or absolute link
 * @param host hostname with protocol prefix
 * @returns boolean
 */
function isLinkOfSameHost(link: string | UrlObject, host: string) {
  try {
    if (typeof link === 'object') {
      return link.hostname === new URL(host).hostname
    }
    return new URL(link).hostname === new URL(host).hostname
  } catch (e) {
    // Relative links fail to parse with new URL(), so we assume they are in fact relative
    return true
  }
}

type IconButtonProps = {
  Icon: ComponentType
} & Pick<React.ComponentProps<'a'>, 'href'>

function IconButton({ Icon, href }: IconButtonProps) {
  return (
    <Link
      href={href}
      target='_blank'
      className={css({
        color: 'text',
        fontSize: '24px',
        '&:hover': {
          color: 'disabled',
        },
      })}
    >
      <Icon />
    </Link>
  )
}

type FooterNavigationGroup = {
  name: string
  links: {
    [name: string]: LinkProps['href'] | ReactElement<unknown>
  }
}

const CONTACT_EMAIL = 'kontakt@republik.ch'

/**
 * Footer server-component
 * @returns Server-Side rendered Footer component per request
 */
export default async function Footer() {
  const { me, hasActiveMembership } = await getMe()

  const { isIOSApp } = getPlatformInformation()

  const navs: FooterNavigationGroup[] = [
    {
      name: me ? 'Meine Republik' : 'Mitglied werden',
      links: {
        Konto: me ? '/konto' : null,
        Profil: me ? `/~${me.slug || me.id}` : null,
        Angebote: !isIOSApp && !hasActiveMembership ? '/angebote' : null,
        Verschenken:
          !isIOSApp && hasActiveMembership
            ? { pathname: '/verschenken', query: { group: 'GIVE' } }
            : null,
        'Gutschein einlösen': !isIOSApp ? '/abholen' : null,
        'Republik teilen':
          me &&
          me.accessCampaigns?.length &&
          me.accessCampaigns.length > 0 &&
          hasActiveMembership
            ? '/teilen'
            : null,
        Anmelden: !me ? '/anmelden' : null,
      },
    },
    {
      name: 'Republik',
      links: {
        'Das sind wir': '/about',
        Jobs: '/format/jobs',
        Cockpit: '/cockpit',
        FAQ: '/faq',
        'Project R': 'https://project-r.construction',
      },
    },
    {
      name: 'Community',
      links: {
        Veranstaltungen: '/veranstaltungen',
        Community: '/community',
        Genossenschaftsrat: '/format/genossenschaftsrat',
        Komplizin: '/komplizin',
        Etikette: '/etikette',
      },
    },
    {
      name: 'Rechtliches',
      links: {
        AGB: '/agb',
        Datenschutz: '/datenschutz',
        'Project R Statuten': '/statuten',
        Aktionariat: '/aktionariat',
        Impressum: '/impressum',
      },
    },
  ]

  return (
    <div
      data-theme='dark'
      className={css({
        bg: 'pageBackground',
        color: 'text',
        '& a': {
          color: 'text',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      })}
    >
      <div
        className={css({
          padding: '40px 15px',
          md: {
            padding: '80px 40px',
            maxWidth: 1230,
            margin: '0 auto',
          },
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          })}
        >
          <Link
            href='/'
            className={css({
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
              height: '36px',
            })}
          >
            <div>
              <svg
                viewBox={logo.LOGO_VIEWBOX}
                className={css({
                  fill: 'text',
                  height: '20px',
                })}
              >
                <path d={logo.LOGO_PATH}></path>
              </svg>
            </div>
            <span
              className={css({
                display: 'none',
                color: 'textSoft',
                fontSize: 's',
                alignSelf: 'flex-end',
                md: {
                  display: 'inline-block',
                },
              })}
            >
              seit 2018
            </span>
          </Link>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'row',
              gap: '24px',
            })}
          >
            <IconButton
              href='https://www.instagram.com/republikmagazin/'
              Icon={IconInstagram}
            />
            <IconButton
              href='https://www.facebook.com/RepublikMagazin'
              Icon={IconLogoFacebook}
            />
            <IconButton
              href='https://bsky.app/profile/republik.ch'
              Icon={IconLogoBluesky}
            />
            <IconButton
              href='https://republik.social/@republik_magazin'
              Icon={IconLogoMastodon}
            />
          </div>
        </div>
        <hr className={css({ color: 'divider' })} />
        <div
          className={css({
            width: 'full',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            md: {
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
            },
          })}
        >
          <div
            className={css({
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '40px',
              flexWrap: 'wrap',
              md: {
                maxWidth: '780px',
                flexDirection: 'row',
                justifyContent: 'space-between',
              },
            })}
          >
            {navs.map((nav: FooterNavigationGroup) => (
              <div
                key={nav.name}
                className={css({ md: { marginLeft: '8px' } })}
              >
                <p
                  className={css({
                    fontSize: 's',
                    color: 'textSoft',
                  })}
                >
                  {nav.name}
                </p>
                <nav
                  className={css({
                    marginTop: '8px',
                  })}
                >
                  <ul
                    className={css({
                      listStyle: 'none',
                      fontSize: 'base',
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: '8px 22px',
                      md: {
                        gap: '8px',
                        flexDirection: 'column',
                      },
                    })}
                  >
                    {Object.keys(nav.links).map((name) => {
                      const link = nav.links[name]
                      if (!link) {
                        return null
                      }

                      if (isValidElement(link)) {
                        return <li key={name}>{link}</li>
                      }

                      const baseURL = PUBLIC_BASE_URL

                      const isExternalLink = !isLinkOfSameHost(link, baseURL)

                      return (
                        <li key={name}>
                          <Link
                            href={link}
                            target={isExternalLink ? '_blank' : undefined}
                            rel={isExternalLink ? 'noreferrer' : undefined}
                          >
                            {name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
          <div
            className={vstack({
              fontSize: 's',
              gap: '20px',
              alignItems: 'flex-start',
              md: {
                marginRight: '70px',
              },
            })}
          >
            <p>
              Republik AG
              <br />
              Sihlhallenstrasse 1<br />
              8004 Zürich
              <br />
              Schweiz
            </p>
            <p>
              <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>
              <br />
              <Link href='/impressum'>Medieninformationen</Link>
            </p>
          </div>
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '2',
            md: {
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
          })}
        >
          <div>
            <LightSwitch />
          </div>

          <div
            className={css({
              display: 'flex',
              flexDirection: 'row',
              alignSelf: 'flex-end',
              alignItems: 'center',
              fontSize: 's',
            })}
          >
            <IconOpensource
              size={20}
              className={css({
                margin: '0 6px 5px 0',
                verticalAlign: 'middle',
              })}
            />
            <a
              href='https://github.com/republik/plattform'
              rel='noreferrer'
              target='_blank'
            >
              Der Republik Code ist Open Source
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
