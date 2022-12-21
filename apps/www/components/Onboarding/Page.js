import { createRef, Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { Query } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
import { withRouter } from 'next/router'
import { css } from 'glamor'

import {
  mediaQueries,
  fontStyles,
  Center,
  Interaction,
  A,
  Button,
  Loader,
  RawHtml,
} from '@project-r/styleguide'
import Greeting, { fragments as fragmentsGreeting } from './Greeting'
import Newsletter, {
  fragments as fragmentsNewsletter,
} from './Sections/Newsletter'
import AppLogin, { fragments as fragmentsAppLogin } from './Sections/AppLogin'
import Usability, {
  fragments as fragmentsUsability,
} from './Sections/Usability'
import Profile, { fragments as fragmentsProfile } from './Sections/Profile'
import Frame from '../Frame'
import { scrollIt } from '../../lib/utils/scroll'
import { HEADER_HEIGHT } from '../constants'
import { SECTION_SPACE } from './Section'
import withT from '../../lib/withT'
import Subscriptions, {
  fragments as fragmentsSubscriptions,
} from './Sections/Subscriptions'
import { ONBOARDING_SECTIONS_REPO_IDS } from '../../lib/constants'
import withInNativeApp from '../../lib/withInNativeApp'
import Link from 'next/link'

import Postcard from './Sections/Postcard'
import Mission from './Sections/Mission'
import Invitation from './Sections/Invitation'
import ClimateProfile from './Sections/ClimateProfile'
import ClimatePersonalInfo from './Sections/ClimatePersonalInfo'

const { P } = Interaction

const QUERY = gql`
  query getOnboarding($repoIds: [ID!]) {
    me {
      ...NewsletterUser
      ...AppLoginUser
      ...UsabilityUser
      ...ProfileUser
      activeMembership {
        active
      }
    }

    employees(shuffle: 1, withGreeting: true) {
      ...GreetingEmployee
    }

    documents(template: "section", repoIds: $repoIds) {
      nodes {
        id
        linkedDocuments {
          totalCount
          nodes {
            ...FormatInfo
          }
        }
      }
    }

    roleStats(role: "climate") {
      count
    }
  }

  ${fragmentsNewsletter.user}
  ${fragmentsAppLogin.user}
  ${fragmentsUsability.user}
  ${fragmentsProfile.user}

  ${fragmentsGreeting.employee}
  ${fragmentsSubscriptions.formats}
`

const CONTEXTS = {
  card: ['newsletter', 'notifications', 'app-login', 'usability'],
  climate: [
    'postcard',
    'mission',
    'invitation',
    'climateprofile',
    'climatepersonalinfo',
  ],
  default: ['newsletter', 'notifications', 'app-login', 'usability', 'profile'],
}

const styles = {
  title: css({
    ...fontStyles.sansSerifMedium58,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 80,
    [mediaQueries.onlyS]: {
      ...fontStyles.sansSerifMedium40,
      marginBottom: 50,
    },
  }),
  p: css({
    marginBottom: 20,
  }),
  sections: css({
    paddingTop: SECTION_SPACE,
    paddingBottom: SECTION_SPACE,
  }),
  buttonContainer: css({
    marginBottom: SECTION_SPACE,
  }),
}

class Page extends Component {
  constructor(props) {
    super(props)

    const {
      router: {
        query,
        query: { context },
      },
      inNativeApp,
    } = props

    const selectedContext = Object.keys(CONTEXTS).includes(context)
      ? CONTEXTS[context]
      : CONTEXTS['default']

    this.sections = [
      {
        component: Newsletter,
        name: 'newsletter',
        ref: createRef(),
        visited: false,
      },
      {
        component: Subscriptions,
        name: 'notifications', // this also gets into the url—we have to avoid «script» in urls
        ref: createRef(),
        visited: false,
      },
      !inNativeApp && {
        component: AppLogin,
        name: 'app-login',
        ref: createRef(),
        visited: false,
      },
      {
        component: Usability,
        name: 'usability',
        ref: createRef(),
        visited: false,
      },
      context !== 'card' && {
        component: Profile,
        name: 'profile',
        ref: createRef(),
        visited: false,
      },
      {
        component: Postcard,
        name: 'postcard',
        ref: createRef(),
        visited: false,
        expanded: true,
      },
      {
        component: Mission,
        name: 'mission',
        ref: createRef(),
        visited: false,
      },
      {
        component: Invitation,
        name: 'invitation',
        ref: createRef(),
        visited: false,
      },
      {
        component: ClimateProfile,
        name: 'climateprofile',
        ref: createRef(),
        visited: false,
      },
      {
        component: ClimatePersonalInfo,
        name: 'climatepersonalinfo',
        ref: createRef(),
        visited: false,
      },
    ]
      // filter by context
      .filter((section) => selectedContext.includes(section.name))
      // sort by context array
      .sort(
        (a, b) =>
          selectedContext.indexOf(a.name) - selectedContext.indexOf(b.name),
      )
      .filter(Boolean)

    this.state = {
      expandedSection: this.sections.find((s) => s.name === query.section)
        ? query.section
        : null,
      hasOnceVisitedAll: false,
    }

    this.onExpand = (props) => {
      this.setState(({ expandedSection }) => ({
        expandedSection: expandedSection === props.name ? null : props.name,
      }))
    }

    this.onContinue = () => {
      const { expandedSection } = this.state
      let sectionIndex = 0

      if (expandedSection) {
        const currentSection = this.sections.find(
          ({ name }) => expandedSection === name,
        )
        currentSection.visited = true

        const nextIndex =
          this.sections.findIndex(({ name }) => expandedSection === name) + 1

        if (nextIndex < this.sections.length) {
          sectionIndex = nextIndex
        } else {
          this.setState({
            expandedSection: null,
            hasOnceVisitedAll: this.sections.every(
              (section) => !!section.visited,
            ),
          })

          return
        }
      }

      this.setState(
        { expandedSection: this.sections[sectionIndex].name },
        () => {
          const { top } =
            this.sections[sectionIndex].ref.current.getBoundingClientRect()
          const { pageYOffset } = window

          const target = pageYOffset + top - HEADER_HEIGHT * 1.2
          scrollIt(target, 400)
        },
      )
    }
  }

  render() {
    const {
      router: {
        query: { context },
      },
      t,
      inNativeIOSApp,
    } = this.props
    const { expandedSection } = this.state

    const meta = {
      title: t.first([
        `Onboarding/Page/${context}/meta/title`,
        'Onboarding/Page/meta/title',
      ]),
    }

    return (
      <Frame meta={meta} raw>
        <Query
          query={QUERY}
          variables={{
            repoIds:
              ONBOARDING_SECTIONS_REPO_IDS &&
              ONBOARDING_SECTIONS_REPO_IDS.split(','),
          }}
        >
          {({ loading, error, data }) => {
            if (loading || error) {
              return <Loader loading={loading} error={error} />
            }

            const { me: user, employees, documents, roleStats } = data

            return (
              <Center>
                <div {...styles.title}>
                  {t.first([
                    `Onboarding/Page/${context}/title`,
                    'Onboarding/Page/title',
                  ])}
                </div>
                <P {...styles.p}>
                  {t.first(
                    [
                      `Onboarding/Page/${context}/preface`,
                      'Onboarding/Page/preface',
                    ],
                    { climate_lab_count: roleStats.count },
                  )}
                </P>
                {context !== 'climate' && context && (
                  <Greeting employee={employees[0]} />
                )}

                <RawHtml
                  type={Interaction.P}
                  dangerouslySetInnerHTML={{
                    __html: t.first(
                      [
                        `Onboarding/Page/${context}/introduction`,
                        'Onboarding/Page/introduction',
                      ],
                      null,
                      '',
                    ),
                  }}
                />

                {!expandedSection && context !== 'climate' && (
                  <Button
                    primary={!this.state.hasOnceVisitedAll}
                    onClick={() => {
                      this.onExpand(this.sections[0])
                    }}
                  >
                    {t('Onboarding/Page/start')}
                  </Button>
                )}

                <div {...styles.sections}>
                  {this.sections.map(
                    ({
                      component: Component,
                      name,
                      ref,
                      visited,
                      expanded,
                    }) => {
                      return (
                        <Component
                          key={name}
                          name={name}
                          user={user}
                          sections={documents.nodes}
                          onExpand={this.onExpand.bind(this)}
                          isExpanded={expanded || expandedSection === name}
                          onContinue={this.onContinue.bind(this)}
                          forwardedRef={ref}
                          isVisited={visited}
                        />
                      )
                    },
                  )}
                </div>

                {!!context && (
                  <Fragment>
                    {/* this.state.hasOnceVisitedAll && (
                      <div style={{ background: colors.primary, height: 140, marginBottom: 20 }}>
                        <P>Grafisches Element, dass alle Section durchgearbeitet wurden und es jetzt losgehen kann.</P>
                      </div>
                    ) */}
                    <div {...styles.buttonContainer}>
                      <Link
                        href={context === 'climate' ? '/klimalaborhq' : ''}
                        passHref
                      >
                        <Button primary={this.state.hasOnceVisitedAll}>
                          {t.first([
                            `Onboarding/Page/${context}/button`,
                            'Onboarding/Page/button',
                          ])}
                        </Button>
                      </Link>
                    </div>
                  </Fragment>
                )}

                <P {...styles.p}>
                  {t.first.elements(
                    [
                      `Onboarding/Page/${context}/more/account`,
                      'Onboarding/Page/more/account',
                    ],
                    {
                      link: (
                        <Link key='account' href='/konto' passHref>
                          <A>
                            {t.first([
                              `Onboarding/Page/${context}/more/account/link`,
                              'Onboarding/Page/more/account/link',
                            ])}
                          </A>
                        </Link>
                      ),
                    },
                  )}
                </P>

                <P {...styles.p}>
                  {t.first.elements(
                    [
                      `Onboarding/Page/${context}/more/questions`,
                      'Onboarding/Page/more/questions',
                    ],
                    {
                      linkManual: (
                        <Link key='anleitung' href='/anleitung' passHref>
                          <A>
                            {t.first([
                              `Onboarding/Page/${context}/more/questions/linkManual`,
                              'Onboarding/Page/more/questions/linkManual',
                            ])}
                          </A>
                        </Link>
                      ),
                      linkFaq: !inNativeIOSApp && (
                        <Link key='route' href='/faq' passHref>
                          <A>
                            {t.first([
                              `Onboarding/Page/${context}/more/questions/linkFaq`,
                              'Onboarding/Page/more/questions/linkFaq',
                            ])}
                          </A>
                        </Link>
                      ),
                    },
                  )}
                </P>
                <P {...styles.p}>
                  {t.first.elements(
                    [
                      `Onboarding/Page/${context}/more/help`,
                      'Onboarding/Page/more/help',
                    ],
                    {
                      email: (
                        <A
                          key='email'
                          href={`mailto:${t(
                            'Onboarding/Page/more/help/email',
                          )}`}
                        >
                          {t('Onboarding/Page/more/help/email')}
                        </A>
                      ),
                    },
                  )}
                </P>
              </Center>
            )
          }}
        </Query>
      </Frame>
    )
  }
}

export default compose(withT, withRouter, withInNativeApp)(Page)
