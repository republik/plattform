#!/usr/bin/env node
/**
 * This script imports users and payments from Bexio data exports
 * For code simplicity the exports first need to be converted to UTF8 CSV
 *
 * Usage:
 * CONTACT_FILE=x.csv PAYMENT_FILE=y.csv DONORBOX_FILE=z.csv ./script/importBexio.js
 */
require('@orbiting/backend-modules-env').config()
const fs = require('fs')
const fetch = require('isomorphic-unfetch')
const { csvParse, csvParseRows, csvFormatRows } = require('d3-dsv')

const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const { t } = require('@orbiting/backend-modules-translate')
const generateMemberships = require('@orbiting/backend-modules-republik-crowdfundings/lib/generateMemberships')
const moment = require('moment')

const { CONTACT_FILE, PAYMENT_FILE, DONORBOX_FILE } = process.env

const BEXIO_DATE_FORMAT = 'DD.MM.YYYY'

const loadFile = async (file) => {
  const text = file.startsWith('https://')
    ? await fetch(file).then((r) => r.text())
    : fs.readFileSync(file, { encoding: 'utf8' })

  const rows = csvParseRows(text).map((row) =>
    row.map((string) => string.trim()),
  )

  return csvParse(csvFormatRows(rows))
}

const manualPkgMap = {
  'RE-00876': 'DONATE',
  'RE-00526': 'DONATE',
  'RE-00143': 'DONATE',
}
const ignorePayments = ['RE-00138']

console.log('running importBexio.js...')
Promise.props({
  pgdb: PgDb.connect(),
  redis: Redis.connect(),
})
  .then(async (connections) => {
    const { pgdb, redis } = connections
    const contacts = await loadFile(CONTACT_FILE)
    const payments = await loadFile(PAYMENT_FILE)
    const donorboxDonations = await loadFile(DONORBOX_FILE)

    console.log(contacts.columns, payments.columns)

    const linkedData = contacts.map((contact) => {
      return {
        contact,
        payments: payments.filter(
          (payment) =>
            payment.Kontaktnummer === contact['Nr.'] &&
            payment.Status === 'Bezahlt' &&
            +payment.Datum.split('.')[2] >= 2019 &&
            !payment.Titel.match(/(referat|spaziergang)/i) &&
            !ignorePayments.includes(payment['Nr.']),
        ),
        donorboxDonations: donorboxDonations.filter(
          (d) => d['Donor Email'] === contact['E-Mail'],
        ),
      }
    })

    const contactsWithPayments = linkedData.filter((d) => d.payments.length)
    console.log({
      Contacts: contacts.length,
      'Contacts without Email': contacts.filter((d) => !d['E-Mail']).length,
      'Contacts with Payments': contactsWithPayments.length,
      'Kontakte with Payments without Email': contactsWithPayments.filter(
        (d) => !d.contact['E-Mail'],
      ).length,
    })

    const languageToLocale = (language) => {
      if (language === 'Französisch') {
        return 'fr'
      } else if (language === 'Deutsch') {
        return 'de'
      } else if (language) {
        console.log('Unkown language:', language)
      }
      return 'de'
    }

    const packages = await pgdb.public.packages.findAll()
    const packageOptions = await pgdb.public.packageOptions.findAll()

    const unkownPayments = []

    const importData = linkedData
      .filter((d) => d.contact['E-Mail'])
      .map(({ contact, payments, donorboxDonations }) => {
        const address = contact.Adresse
          ? {
              name: `${contact['Name 2']} ${contact['Name 1']}`,
              line1: contact.Adresse,
              postalCode: contact.PLZ,
              city: contact.Ort,
              country: contact.Land || 'Schweiz',
            }
          : undefined

        const user = {
          email: contact['E-Mail'],
          firstName: contact['Name 2'],
          lastName: contact['Name 1'],
          locale: languageToLocale(contact.Sprache),
          phoneNumber: contact.Telefon || contact.Mobile || undefined,
          adminNotes: contact['Nr.']
            ? [
                `Bexio Import Nr. ${contact['Nr.']}`,
                contact.Telefon && contact.Mobile
                  ? `Mobile: ${contact.Mobile}`
                  : '',
                contact['E-Mail 2'] ? `E-Mail 2: ${contact['E-Mail 2']}` : '',
                contact.Kategorie ? `Kategorie: ${contact.Kategorie}` : '',
                donorboxDonations.length
                  ? 'Es wurden nur Donorbox Zahlungen importiert.'
                  : '',
                contact.Bemerkungen
                  ? `\nBemerkungen: ${contact.Bemerkungen}`
                  : '',
              ]
                .filter(Boolean)
                .join('\n')
            : 'Donorbox Import',
        }

        const wasEverMember = contact.Kategorie.match(/mitglied/i)
        const isAutoPaying = !!contact.Kategorie.match(/automatisch-jaehrlich/)

        const paymentsNormalized = donorboxDonations.length
          ? donorboxDonations.map((donation) => {
              const date = moment(
                donation['Donated At'],
                'DD/MM/YYYY HH:mm:ss',
              ).format(BEXIO_DATE_FORMAT)
              return {
                package:
                  donation.Campaign === 'Mitgliedschaft' ? 'YEAR' : 'DONATE',
                total: +donation.Amount,
                date,
                beginDate:
                  donation.Campaign === 'Mitgliedschaft' ? date : undefined,
                method: donation['Donation Type'].toUpperCase(),
                pspId:
                  donation['Stripe Charge Id'] ||
                  donation['Paypal Transaction Id'],
                // pspPayload: donation
              }
            })
          : payments.map((payment) => {
              const pkg = payment.Titel.match(
                /Mitgliederbeitrag|Mitgliedschaft|Cotisation/,
              )
                ? 'YEAR'
                : payment.Titel.match(/(Spende|^Dons?$)/)
                ? 'DONATE'
                : payment['Betrag Brutto'] === '50.0000' && wasEverMember
                ? 'YEAR'
                : manualPkgMap[payment['Nr.']]

              let year = payment.Datum.split('.')[2]
              if (!isAutoPaying && payment.Datum.endsWith('01.2020')) {
                year = '2019'
              }
              return {
                package: pkg,
                beginDate:
                  pkg === 'YEAR'
                    ? isAutoPaying
                      ? payment.Datum
                      : `01.01.${year}`
                    : undefined,
                date: payment.Datum,
                total: +payment['Betrag Brutto'],
                // isAutoPaying,
                // payment,
              }
            })

        // we only import last year of memberships
        const minBeginDate = moment('22.10.2021', BEXIO_DATE_FORMAT)
        // for donations we only import the last year
        const minDate = moment('01.01.2022', BEXIO_DATE_FORMAT)
        const pledges = paymentsNormalized
          .filter((payment) => {
            if (payment.package === 'YEAR') {
              return (
                moment(payment.beginDate, BEXIO_DATE_FORMAT) >= minBeginDate
              )
            }
            return moment(payment.date, BEXIO_DATE_FORMAT) >= minDate
          })
          .map((payment) => {
            const pkg = packages.find((p) => p.name === payment.package)

            return {
              ...payment,
              total: payment.total * 100,
              donation:
                (payment.total - (payment.package === 'YEAR' ? 50 : 1)) * 100,
              packageId: pkg.id,
              options: packageOptions
                .filter((po) => po.packageId === pkg.id)
                .map((po) => ({
                  amount: po.defaultAmount,
                  price: po.price,
                  templateId: po.id,
                })),
            }
          })

        if (paymentsNormalized.find((p) => !p.package)) {
          unkownPayments.push({ contact, pledges })
        }

        return {
          user,
          address,
          pledges,
          paymentsNormalized,
        }
      })

    console.log(`Importing ${importData.length} Contacts with Email`)
    let progress = 0

    if (unkownPayments.length) {
      console.log(
        'unkownPayments',
        JSON.stringify(unkownPayments, undefined, 2),
      )
      console.log('exit without import')
      process.exit()
    }

    // fs.writeFileSync(
    //   './importData.json',
    //   JSON.stringify(importData, undefined, 2),
    //   {
    //     encoding: 'utf8',
    //   },
    // )
    // process.exit()
    await Promise.map(
      importData,
      async ({ user: userData, address: addressData, pledges }) => {
        const pendingMembershipGenerations = []
        const transaction = await pgdb.transactionBegin()
        try {
          let user = await transaction.public.users.findOne({
            email: userData.email,
          })
          const hasBeenImportedBefore = !!user?.adminNotes?.match(/Bexio/)
          if (!user) {
            user = await transaction.public.users.insertAndGet(userData)
          }

          const updateUser = {}
          if (!hasBeenImportedBefore) {
            updateUser.adminNotes = [user.adminNotes, userData.adminNotes]
              .filter(Boolean)
              .join('\n\n')
          }

          if (!user.addressId && addressData) {
            const address = await transaction.public.addresses.insertAndGet(
              addressData,
            )
            updateUser.addressId = address.id
          }
          if (!user.phoneNumber && userData.phoneNumber) {
            updateUser.phoneNumber = userData.phoneNumber
          }

          if (Object.keys(updateUser).length) {
            await transaction.public.users.updateOne(
              { id: user.id },
              {
                ...updateUser,
                updatedAt: new Date(),
              },
            )
          }

          if (!hasBeenImportedBefore) {
            for (const pledge of pledges) {
              // insert pledge
              const newPledge = await transaction.public.pledges.insertAndGet({
                userId: user.id,
                packageId: pledge.packageId,
                total: pledge.total,
                donation: pledge.donation,
                payload: {
                  source: 'Bexio Import',
                },
                status: 'SUCCESSFUL',
                createdAt: moment(pledge.date, BEXIO_DATE_FORMAT),
                updatedAt: new Date(),
              })

              // load data
              const packageOptions =
                await transaction.public.packageOptions.find({
                  id: pledge.options.map((plo) => plo.templateId),
                })
              const rewardIds = packageOptions.map((option) => option.rewardId)
              const rewards =
                rewardIds.length > 0
                  ? await pgdb.public.rewards.find({
                      id: rewardIds,
                    })
                  : []

              const goodies =
                rewards.length > 0
                  ? await pgdb.public.goodies.find({
                      rewardId: rewards.map((reward) => reward.id),
                    })
                  : []

              const membershipTypes =
                rewards.length > 0
                  ? await pgdb.public.membershipTypes.find({
                      rewardId: rewards.map((reward) => reward.id),
                    })
                  : []

              rewards.forEach((reward, index, rewards) => {
                const goodie = goodies.find((g) => g.rewardId === reward.id)
                const membershipType = membershipTypes.find(
                  (m) => m.rewardId === reward.id,
                )

                rewards[index] = Object.assign(
                  {},
                  reward,
                  membershipType,
                  goodie,
                )
              })

              packageOptions.forEach((packageOption, index, packageOptions) => {
                packageOptions[index].reward = rewards.find(
                  (reward) => packageOption.rewardId === reward.rewardId,
                )
              })

              // insert pledgeOptions
              await Promise.all(
                pledge.options.map((plo) => {
                  plo.pledgeId = newPledge.id

                  const pko = packageOptions.find(
                    (pko) => pko.id === plo.templateId,
                  )
                  plo.vat = pko.vat
                  plo.potPledgeOptionId = pko.potPledgeOptionId
                  plo.accessGranted = pko.accessGranted

                  if (
                    pko.reward &&
                    pko.reward.rewardType === 'MembershipType' &&
                    !plo.periods
                  ) {
                    plo.periods = pko.reward.defaultPeriods
                  }

                  // the FE doesn't distribute the surplus / donation amout to pledgeOptions
                  // DONATE* packages always only have one packageOption
                  if (pledge.options.length === 1) {
                    plo.total = newPledge.total
                  }

                  return transaction.public.pledgeOptions.insertAndGet(plo)
                }),
              )

              const payment = await transaction.public.payments.insertAndGet({
                type: 'PLEDGE',
                method: pledge.method || 'PAYMENTSLIP',
                total: pledge.total,
                status: 'PAID',
                pspId: pledge.pspId,
                pspPayload: pledge.pspPayload,
                createdAt: moment(pledge.date, BEXIO_DATE_FORMAT),
                updatedAt: new Date(),
              })

              // insert pledgePayment
              await transaction.public.pledgePayments.insert({
                pledgeId: newPledge.id,
                paymentId: payment.id,
                paymentType: 'PLEDGE',
              })
              if (pledge.package === 'YEAR') {
                pendingMembershipGenerations.push([
                  newPledge.id,
                  pledge.beginDate,
                ])
              }
            }
          }

          await transaction.transactionCommit()
        } catch (e) {
          console.error(e)
          await transaction.transactionRollback()
          throw new Error(t('api/unexpected'))
        }
        for (const [pledgeId, beginDate] of pendingMembershipGenerations) {
          await generateMemberships(pledgeId, pgdb, t, redis, {
            startAt: moment(beginDate, BEXIO_DATE_FORMAT),
            skipMailchimp: true,
          })
        }
        progress++
        if (progress % 10 === 0 || progress < 2) {
          console.log(`processed ${progress}/${importData.length}`)
        }
      },
      {
        concurrency: 10,
      },
    )
    console.log(`processed ${progress}/${importData.length}`)

    return connections
  })
  .then(async ({ pgdb, redis }) => {
    console.log('finished')
    await PgDb.disconnect(pgdb)
    await Redis.disconnect(redis)
    console.log('disconnected')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
