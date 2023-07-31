const { timeFormat, timeParse } = require('d3-time-format')
const { timeYear, timeMonth } = require('d3-time')
const { descending } = require('d3-array')
const striptags = require('striptags')
const entities = require('entities')
const { createFormatter } = require('@project-r/styleguide')
const { DRUPAL_IMAGE_BASE_URL } = require('../constants')

const parseDate = timeParse('%Y-%m-%d')
const formatDate = timeFormat('%d.%m.%Y')
const formatTime = timeFormat('%d.%m.%Y %H:%M')
const formatDateIso = timeFormat('%Y-%m-%d')

const potencyMap = {
  3: 'HIGH',
  2: 'MEDIUM',
  1: 'LOW',
}

const compensationTransparenceStateMap = {
  ja: 'YES',
  nein: 'NO',
  teilweise: 'PARTIAL',
}

exports.mapFormatterWithLocale = (translations) => {
  const formatter = createFormatter(translations)
  formatter.locale = translations.locale
  return formatter
}

const mapFunction = (
  t,
  { art, funktion_im_gremium: funktion, rechtsform, gender },
) => {
  let translated = t.first(
    [
      `connection/function/${rechtsform}-${art}-${funktion}-${gender}`,
      `connection/function/${art}-${funktion}`,
    ],
    {},
    null,
  )
  if (translated === null) {
    translated = [
      art && t(`connection/art/${art}`, {}, art),
      funktion &&
        funktion !== art &&
        t.first(
          [
            `connection/funktion_im_gremium/${funktion}-${gender}`,
            `connection/funktion_im_gremium/${funktion}`,
          ],
          {},
          funktion,
        ),
    ]
      .filter(Boolean)
      .join(', ')
  }
  return translated
}

const mapCompensations = (verguetungen) => {
  return (verguetungen || [])
    .map((raw) => {
      const money =
        raw.verguetung !== undefined && raw.verguetung !== null
          ? +raw.verguetung
          : null
      return {
        year: raw.jahr && +raw.jahr,
        money,
        description:
          (money === -1 && raw.beschreibung === 'Bezahlendes Mitglied') ||
          (money === 0 && raw.beschreibung === 'Ehrenamtlich') ||
          (money === 1 && raw.beschreibung === 'Bezahlt')
            ? null
            : raw.beschreibung || null,
      }
    })
    .sort((a, b) => descending(a.year, b.year))
    .filter((d) => d.year && (d.money !== null || d.description !== null))
}

const mapParliamentariansFromConnections = (raw, t, origin) => {
  return raw.connections.map((connection) => {
    const parliamentarianRaw = raw.parlamentarier.find(
      (p) => p.id === connection.parlamentarier_id,
    )
    if (!parliamentarianRaw) {
      console.warn(
        '[mappers]',
        `Connection: missing parliamentarian ${connection.parlamentarier_id} ${connection.parlamentarier_name} (${raw.id} ${raw.name})`,
      )
      return null
    }
    const parliamentarian = mapParliamentarian(parliamentarianRaw, t)

    const rawConnectorOrganisation = raw.organisationen.find(
      (org) => org.id === connection.connector_organisation_id,
    )
    if (!rawConnectorOrganisation) {
      console.warn(
        '[mappers]',
        `Connection: missing connector organisation ${connection.connector_organisation_id} (${raw.id} ${raw.name} -> ${connection.parlamentarier_id} ${connection.parlamentarier_name})`,
      )
      return null
    }
    // filter out simple memberships of parlamentarian groups
    // https://lobbywatch.slack.com/archives/CLXU2R9V0/p1603379470004900
    // https://lobbywatch.slack.com/archives/CLXU2R9V0/p1654865241867899
    if (
      (rawConnectorOrganisation.rechtsform === 'Parlamentarische Gruppe' ||
        rawConnectorOrganisation.rechtsform ===
          'Parlamentarische Freundschaftsgruppe') &&
      connection.art === 'mitglied'
    ) {
      return null
    }
    const connectorOrganisation = mapOrganisation(rawConnectorOrganisation, t)
    const rawIntermediateOrganisation =
      connection.zwischen_organisation_id &&
      raw.zwischen_organisationen?.find(
        (org) => org.id === connection.zwischen_organisation_id,
      )
    if (!rawIntermediateOrganisation && connection.zwischen_organisation_id) {
      console.warn(
        '[mappers]',
        `Connection: missing intermediate organisation ${connection.zwischen_organisation_id} (${raw.id} ${raw.name} -> ${connection.parlamentarier_id} ${connection.parlamentarier_name})`,
      )
      return null
    }
    const intermediateOrganisation =
      rawIntermediateOrganisation &&
      mapOrganisation(rawIntermediateOrganisation, t)

    let directFunction
    if (!intermediateOrganisation && !connection.id) {
      directFunction = () =>
        mapFunction(
          t,
          Object.assign({}, connection, {
            rechtsform: connectorOrganisation.legalFormId,
            gender: parliamentarian.gender,
          }),
        )
    }
    const vias = [
      {
        from: origin,
        to: connectorOrganisation,
        function: directFunction,
      },
    ]
    if (intermediateOrganisation) {
      vias.push({
        from: connectorOrganisation,
        to: intermediateOrganisation,
        function: t(`connections/art/${connection.zwischen_organisation_art}`),
      })
    }
    if (connection.person_id && raw.zutrittsberechtigte) {
      const rawGuest = raw.zutrittsberechtigte.find(
        (g) => g.person_id === connection.person_id,
      )
      if (!rawGuest) {
        console.warn(
          `[mappers] Connection: missing guest ${connection.person_id} ${connection.zutrittsberechtigter} (${raw.id} ${raw.name} -> ${connection.parlamentarier_id} ${connection.parlamentarier_name})`,
        )
        // can happen when e.g. the guest is not published yet
        // kill the connection
        return null
      }
      const guest = mapGuest(rawGuest, t)
      const org = intermediateOrganisation || connectorOrganisation
      vias.push({
        from: org,
        to: guest,
        function: () =>
          mapFunction(
            t,
            Object.assign({}, connection, {
              rechtsform: org.legalFormId,
              gender: guest.gender,
            }),
          ),
      })
    }

    return {
      from: origin,
      vias,
      to: parliamentarian,
      group: parliamentarian.partyMembership
        ? parliamentarian.partyMembership.party.abbr
        : t('connections/party/none'),
    }
  })
}

const lobbyGroupIdPrefix = (exports.lobbyGroupIdPrefix = 'LobbyGroup-')
exports.mapLobbyGroup = (raw, t) => {
  const connections = () => {
    const organisations = raw.organisationen.map((connection) => ({
      from: lobbyGroup,
      vias: [],
      to: {
        id: `${orgIdPrefix}${connection.id}-${t.locale}`,
        name: connection.name,
      },
      group: t('connections/organisation'),
      description: connection.beschreibung,
    }))

    const parliamentariansViaProfession = raw.parlamentarier
      .filter((p) => p.beruf_interessengruppe_id === raw.id)
      .map((parliamentarianRaw) => {
        const parliamentarian = mapParliamentarian(parliamentarianRaw, t)

        return {
          from: lobbyGroup,
          vias: [],
          function: parliamentarianRaw.beruf,
          to: parliamentarian,
          group: parliamentarian.partyMembership
            ? parliamentarian.partyMembership.party.abbr
            : t('connections/party/none'),
        }
      })

    const parliamentariansViaCon = mapParliamentariansFromConnections(
      raw,
      t,
      lobbyGroup,
    )

    return organisations
      .concat(parliamentariansViaProfession)
      .concat(parliamentariansViaCon)
      .filter(Boolean)
  }

  const lobbyGroup = {
    id: `${lobbyGroupIdPrefix}${raw.id}-${t.locale}`,
    updated: () => formatDate(new Date(raw.updated_date_unix * 1000)),
    published: () => formatDate(new Date(raw.freigabe_datum_unix * 1000)),
    updatedIso: () => formatDateIso(new Date(raw.updated_date_unix * 1000)),
    publishedIso: () => formatDateIso(new Date(raw.freigabe_datum_unix * 1000)),
    name: raw.name,
    sector: raw.branche,
    branch: {
      id: `${branchIdPrefix}${raw.branche_id}-${t.locale}`,
      name: raw.branche,
    },
    wikipedia_url: raw.wikipedia,
    wikidata_url: raw.wikidata_item_url,
    description: raw.beschreibung,
    commissions: [
      {
        id: `${commissionIdPrefix}${raw.kommission1_id}-${t.locale}`,
        name: raw.kommission1_name,
        abbr: raw.kommission1_abkuerzung,
      },
      {
        id: `${commissionIdPrefix}${raw.kommission2_id}-${t.locale}`,
        name: raw.kommission2_name,
        abbr: raw.kommission2_abkuerzung,
      },
    ].filter((c) => c.name),
    connections,
  }
  return lobbyGroup
}

const branchIdPrefix = (exports.branchIdPrefix = 'Branch-')
exports.mapBranch = (raw, t) => {
  const connections = () => {
    const lobbygroups = raw.interessengruppe.map((connection) => ({
      from: branch,
      vias: [],
      to: {
        id: `${lobbyGroupIdPrefix}${connection.id}-${t.locale}`,
        name: connection.name,
      },
      group: t('connections/lobbyGroup'),
      description: connection.beschreibung,
    }))
    const parliamentarians = mapParliamentariansFromConnections(raw, t, branch)
    return parliamentarians.concat(lobbygroups).filter(Boolean)
  }

  const branch = {
    id: `${branchIdPrefix}${raw.id}-${t.locale}`,
    updated: () => formatDate(new Date(raw.updated_date_unix * 1000)),
    published: () => formatDate(new Date(raw.freigabe_datum_unix * 1000)),
    updatedIso: () => formatDateIso(new Date(raw.updated_date_unix * 1000)),
    publishedIso: () => formatDateIso(new Date(raw.freigabe_datum_unix * 1000)),
    name: raw.name,
    description: raw.beschreibung,
    wikipedia_url: raw.wikipedia,
    wikidata_url: raw.wikidata_item_url,
    commissions: [
      {
        id: `${commissionIdPrefix}${raw.kommission_id}-${t.locale}`,
        name: raw.kommission1_name,
        abbr: raw.kommission1_abkuerzung,
      },
      {
        id: `${commissionIdPrefix}${raw.kommission2_id}-${t.locale}`,
        name: raw.kommission2_name,
        abbr: raw.kommission2_abkuerzung,
      },
    ].filter((c) => c.name),
    connections,
  }
  return branch
}

const orgIdPrefix = (exports.orgIdPrefix = 'Organisation-')
const mapOrganisation = (exports.mapOrganisation = (raw, t) => {
  const connections = () => {
    const direct = raw.parlamentarier.map((directConnection) => {
      const parliamentarian = mapParliamentarian(directConnection, t)
      return {
        from: org,
        vias: [],
        to: parliamentarian,
        group: parliamentarian.partyMembership
          ? parliamentarian.partyMembership.party.abbr
          : t('connections/party/none'),
        compensations: mapCompensations(directConnection.verguetungen_pro_jahr),
        function: mapFunction(
          t,
          Object.assign({}, directConnection, {
            gender: parliamentarian.gender,
            rechtsform: org.legalFormId,
          }),
        ),
        description: directConnection.beschreibung,
      }
    })
    const indirect = []
    for (const rawGuest of raw.zutrittsberechtigte) {
      if (rawGuest.parlamentarier) {
        const parliamentarian = mapParliamentarian(rawGuest.parlamentarier, t)
        const guest = mapGuest(rawGuest, t)
        indirect.push({
          from: org,
          vias: [
            {
              from: org,
              to: guest,
              function: mapFunction(
                t,
                Object.assign({}, rawGuest, {
                  gender: guest.gender,
                  rechtsform: org.legalFormId,
                }),
              ),
              description: rawGuest.beschreibung,
            },
          ],
          to: parliamentarian,
          group: parliamentarian.partyMembership
            ? parliamentarian.partyMembership.party.abbr
            : t('connections/party/none'),
        })
      }
    }
    const relations = raw.beziehungen.map((connection) => ({
      from: org,
      to: {
        id: `${orgIdPrefix}${connection.ziel_organisation_id}-${t.locale}`,
        name: connection.ziel_organisation_name,
      },
      vias: [],
      group: t(`connections/groups/${connection.art}`),
      description: connection.beschreibung,
    }))
    return [...direct, ...indirect].concat(relations)
  }

  const org = {
    id: `${orgIdPrefix}${raw.id}-${t.locale}`,
    updated: () => formatDate(new Date(raw.updated_date_unix * 1000)),
    published: () => formatDate(new Date(raw.freigabe_datum_unix * 1000)),
    updatedIso: () => formatDateIso(new Date(raw.updated_date_unix * 1000)),
    publishedIso: () => formatDateIso(new Date(raw.freigabe_datum_unix * 1000)),
    name: raw.name,
    abbr: raw.abkuerzung,
    legalForm: t(
      `organisation/legalForm/${raw.rechtsform}`,
      {},
      raw.rechtsform,
    ),
    legalFormId: raw.rechtsform,
    location: raw.ort,
    postalCode: raw.adresse_plz,
    countryIso2: raw.land_iso2,
    description: raw.beschreibung,
    lobbyGroups: [
      { name: raw.interessengruppe, id: raw.interessengruppe_id },
      { name: raw.interessengruppe2, id: raw.interessengruppe2_id },
      { name: raw.interessengruppe3, id: raw.interessengruppe3_id },
    ].filter((l) => l.name),
    uid: raw.uid,
    website: raw.homepage,
    wikipedia_url: raw.wikipedia,
    wikidata_url: raw.wikidata_item_url,
    twitter_name: raw.twitter_name,
    twitter_url: raw.twitter_url,
    connections,
  }
  return org
})

const commissionIdPrefix = (exports.commissionIdPrefix = 'Commission-')

const mapMandate = (origin, connection, t) => ({
  from: () => origin,
  vias: [],
  to: {
    id: `${orgIdPrefix}${connection.organisation_id}-${t.locale}`,
    name: connection.organisation_name,
  },
  group: connection.interessengruppe,
  potency:
    connection.wirksamkeit_index && potencyMap[connection.wirksamkeit_index],
  function: () =>
    mapFunction(t, Object.assign({ gender: origin.gender }, connection)),
  description: connection.beschreibung,
  compensations: mapCompensations(connection.verguetungen_pro_jahr),
  compensation:
    connection.verguetung !== null
      ? {
          year: connection.verguetung_jahr && +connection.verguetung_jahr,
          money: +connection.verguetung,
          description: connection.verguetung_beschreibung,
        }
      : null,
})

const guestIdPrefix = (exports.guestIdPrefix = 'Guest-')
const mapGuest = (exports.mapGuest = (raw, t) => {
  const guest = {
    id: `${guestIdPrefix}${raw.id}-${t.locale}`,
    updated: () => formatDate(new Date(raw.last_modified_date_unix * 1000)),
    published: () => formatDate(new Date(raw.freigabe_datum_unix * 1000)),
    updatedIso: () => formatDateIso(new Date(raw.updated_date_unix * 1000)),
    publishedIso: () => formatDateIso(new Date(raw.freigabe_datum_unix * 1000)),
    name: () => `${raw.vorname} ${raw.nachname}`,
    firstName: raw.vorname,
    middleName: raw.zweiter_vorname,
    lastName: raw.nachname,
    occupation: raw.beruf,
    gender: raw.geschlecht,
    function: raw.funktion,
    website: raw.homepage,
    wikipedia_url: raw.wikipedia,
    wikidata_url: raw.wikidata_item_url,
    twitter_name: raw.twitter_name,
    twitter_url: raw.twitter_url,
    linkedin_url: raw.linkedin_profil_url,
    facebook_name: raw.facebook_name,
    facebook_url: raw.facebook_url,
    parliamentarian: () => mapParliamentarian(raw.parlamentarier, t),
  }
  guest.connections = (raw.mandate || []).map((connection) =>
    mapMandate(guest, connection, t),
  )
  return guest
})

const parliamentarianIdPrefix = (exports.parliamentarianIdPrefix =
  'Parliamentarian-')
const mapParliamentarian = (exports.mapParliamentarian = (raw, t) => {
  const dateOfBirth = parseDate(raw.geburtstag)
  const councilJoinDate = new Date(+raw.im_rat_seit_unix * 1000)
  const councilExitDate = raw.im_rat_bis_unix
    ? new Date(+raw.im_rat_bis_unix * 1000)
    : null

  const guests = (raw.zutrittsberechtigungen || []).map((g) => mapGuest(g, t))

  const connections = () => {
    // filter out simple memberships of parlamentarian groups
    // https://lobbywatch.slack.com/archives/CLXU2R9V0/p1603379470004900
    // https://lobbywatch.slack.com/archives/CLXU2R9V0/p1654865241867899
    const direct = raw.interessenbindungen
      .filter(
        (directConnection) =>
          !(
            (directConnection.rechtsform === 'Parlamentarische Gruppe' ||
              directConnection.rechtsform ===
                'Parlamentarische Freundschaftsgruppe') &&
            directConnection.art === 'mitglied'
          ),
      )
      .map((directConnection) =>
        mapMandate(parliamentarian, directConnection, t),
      )
    const indirect = []
    for (const guest of guests) {
      for (const indirectConnection of guest.connections) {
        indirect.push(
          Object.assign({}, indirectConnection, {
            from: parliamentarian,
            vias: [
              {
                from: parliamentarian,
                to: guest,
                function: guest.function,
              },
            ],
          }),
        )
      }
    }
    return [...direct, ...indirect]
  }

  const ROUNDING_PRECISION = 1000

  const parliamentarian = {
    id: `${parliamentarianIdPrefix}${raw.parlamentarier_id || raw.id}-${
      t.locale
    }`,
    updated: () => formatDate(new Date(raw.last_modified_date_unix * 1000)),
    published: () => formatDate(new Date(raw.freigabe_datum_unix * 1000)),
    updatedIso: () => formatDateIso(new Date(raw.updated_date_unix * 1000)),
    publishedIso: () => formatDateIso(new Date(raw.freigabe_datum_unix * 1000)),
    name: () => `${raw.vorname} ${raw.nachname}`,
    parliamentId: raw.parlament_biografie_id,
    firstName: raw.vorname,
    middleName: raw.zweiter_vorname,
    lastName: raw.nachname,
    occupation: raw.beruf,
    wikipedia_url: raw.wikipedia,
    wikidata_url: raw.wikidata_item_url,
    twitter_name: raw.twitter_name,
    twitter_url: raw.twitter_url,
    linkedin_url: raw.linkedin_profil_url,
    facebook_name: raw.facebook_name,
    facebook_url: raw.facebook_url,
    parlament_biografie_url: raw.parlament_biografie_url,
    gender: raw.geschlecht,
    dateOfBirth: formatDate(dateOfBirth),
    portrait: [
      DRUPAL_IMAGE_BASE_URL,
      'sites/lobbywatch.ch/app/files/parlamentarier_photos/portrait-260',
      `${raw.parlament_number}.jpg`,
    ].join('/'),
    age: () => {
      const now = new Date()
      let age = timeYear.count(dateOfBirth, now)
      const months = now.getMonth() - dateOfBirth.getMonth()
      if (
        months < 0 ||
        (months === 0 && now.getDate() < dateOfBirth.getDate())
      ) {
        age -= 1
      }
      return age
    },
    partyMembership: raw.partei
      ? {
          function: raw.parteifunktion,
          party: {
            name: raw.partei_name,
            abbr: raw.partei,
            wikipedia_url: raw.wikipedia,
            wikidata_url: raw.wikidata_item_url,
            twitter_name: raw.twitter_name,
            twitter_url: raw.twitter_url,
          },
        }
      : null,
    canton: raw.kanton_name,
    active: !!+raw.aktiv,
    council: raw.ratstyp,
    councilTitle: () => {
      return t(
        'parliamentarian/council/title/' +
          `${parliamentarian.council}-${parliamentarian.gender}${
            parliamentarian.active ? '' : '-Ex'
          }`,
      )
    },
    councilTenure: () => {
      const end = councilExitDate || new Date()
      return timeMonth.count(councilJoinDate, end)
    },
    councilJoinDate: formatDate(councilJoinDate),
    councilExitDate: councilExitDate && formatDate(councilExitDate),
    represents:
      Math.round(+raw.vertretene_bevoelkerung / ROUNDING_PRECISION) *
      ROUNDING_PRECISION,
    children: raw.anzahl_kinder !== null ? +raw.anzahl_kinder : null,
    civilStatus: () => {
      return t(
        'parliamentarian/civilStatus/' +
          `${parliamentarian.gender}-${raw.zivilstand}`,
        undefined,
        raw.zivilstand,
      )
    },
    website: raw.homepage,
    commissions: raw.in_kommission
      ? raw.in_kommission.map((commission) => ({
          id: `${commissionIdPrefix}${commission.id}-${t.locale}`,
          name: commission.name,
          abbr: commission.abkuerzung,
        }))
      : [],
    compensationTransparence: () =>
      raw.verguetungstransparenz_beurteilung
        ? {
            dueDate: raw.verguetungstransparenz_beurteilung_stichdatum,
            isTansparent:
              compensationTransparenceStateMap[
                raw.verguetungstransparenz_beurteilung
              ],
          }
        : null,
    guests,
    connections,
  }
  return parliamentarian
})

exports.mapPage = (locale, raw, statusCode) => {
  const image = raw.field_image && raw.field_image[0] && raw.field_image[0].url
  const content = raw.body.value
    ? raw.body.value.replace(
        /"(\/sites\/lobbywatch\.ch\/files\/)/g,
        (_, path) => {
          return `"${DRUPAL_IMAGE_BASE_URL}${path}`
        },
      )
    : 'Nicht unterstützter Inhalt / Contenu non pris en charge'
  return Object.assign({}, raw, {
    statusCode,
    path: raw.path.split('/'),
    translations: Object.keys(raw.translations || {})
      .filter((key) => key !== locale)
      .map((key) => ({
        locale: key,
        path: raw.translations[key].split('/'),
      })),
    author: raw.type === 'article' ? raw.field_author : null,
    authorUid: raw.type === 'article' ? raw.field_author_uid : null,
    published:
      raw.type === 'article' && raw.created
        ? formatTime(+raw.created * 1000)
        : null,
    updated:
      raw.type === 'article' && raw.changed
        ? formatTime(+raw.changed * 1000)
        : null,
    publishedIso:
      raw.type === 'article' && raw.created
        ? formatDateIso(+raw.created * 1000)
        : null,
    updatedIso:
      raw.type === 'article' && raw.changed
        ? formatDateIso(+raw.changed * 1000)
        : null,
    content,
    type: raw.type,
    nid: raw.nid,
    lead: entities.decodeHTML(striptags(raw.body.value).trim().split('\n')[0]),
    categories: (raw.field_category || []).map((category) => category.name),
    tags: (raw.field_tags || []).map((tag) => tag.name),
    lobbyGroups: (raw.field_lobby_group || []).map((group) => group.name),
    image: image,
  })
}

exports.mapMeta = (locale, raw) => {
  return Object.assign(
    {
      id: `Meta-${locale}`,
    },
    raw,
    {
      links: raw.links.map((link) => ({
        id: `MenuLink-${link.id}-${locale}`,
        parentId: +link.parentId
          ? `MenuLink-${link.parentId}-${locale}`
          : 'MenuLink-Root',
        title: link.title,
        href: link.href,
      })),
      blocks: ({ region }) =>
        (region
          ? raw.blocks.filter((block) => block.region === region)
          : raw.blocks
        ).map((block) => ({
          id: `${block.key}-${locale}`,
          ...block,
        })),
    },
  )
}
