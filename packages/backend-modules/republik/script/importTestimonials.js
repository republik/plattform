#!/usr/bin/env node
/**
 * This script imports testimonials from a google spread sheet
 *
 * Usage:
 * KEY=x ./script/importTestimonials.js
 */
require('@orbiting/backend-modules-env').config()
const fetch = require('isomorphic-unfetch')
const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const {
  lib: { Portrait },
} = require('@orbiting/backend-modules-assets')
const gsheets = require('gsheets')

const { KEY, TITLE = 'import' } = process.env

if (!KEY) {
  console.log('provide KEY=GoogleSpreadSheetKey')
  process.exit()
}

console.log('running importTestimonials.js...')
PgDb.connect()
  .then(async (pgdb) => {
    const sheet = await gsheets.getWorksheet(KEY, TITLE)

    const keys = Object.keys(sheet.data[0])
    const statementKey = keys.find((key) =>
      key.match(
        /(Ich stehe mit Foto und Namen für .+ ein)|(Je porte la campagne de .+ avec mon nom et ma photo)/,
      ),
    )
    console.log('statementKey', statementKey)

    const testimonials = sheet.data
      .filter((d) => d[statementKey] && d[statementKey].trim())
      .map((d) => {
        const name = (d.Name || d.Nom).trim()
        return {
          email: d['E-Mail-Adresse'] || d['Adresse e-mail'],
          firstName: name.split(' ').slice(0, -1).join(' '),
          lastName: name.split(' ').slice(-1).join(' '),
          statement: d[statementKey].trim(),
          portrait: d['Porträtfoto'] || d['Photo-portrait'],
          credential: d['Funktion/Tätigkeit'] || d['Fonction/Activité'],
        }
      })

    let progress = 0

    await Promise.map(
      testimonials,
      async (testimonial) => {
        const { firstName, lastName, email } = testimonial
        const portrait = await fetch(testimonial.portrait)
          .catch((error) => {
            console.error('image fetch failed', { testimonial, error })
          })
          .then((result) => result.buffer())
        if (!portrait) {
          return
        }

        const transaction = await pgdb.transactionBegin()
        try {
          let user = await transaction.public.users.findOne({ email })
          if (!user) {
            user = await transaction.public.users.insertAndGet({
              firstName,
              lastName,
              email: email,
            })
          }

          const updateUser = {}
          if (!user.isListed) {
            updateUser.isListed = true
          }
          if (user.statement !== testimonial.statement) {
            updateUser.statement = testimonial.statement
          }
          if (!user.portraitUrl) {
            updateUser.portraitUrl = await Portrait.upload(portrait).catch(
              (error) => {
                console.error('uploadPortrait failed', { testimonial, error })
              },
            )
          }
          if (!user.firstName) {
            updateUser.firstName = testimonial.firstName
          }
          if (!user.lastName) {
            updateUser.lastName = testimonial.lastName
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
          const description = testimonial.credential?.trim()
          if (description) {
            await transaction.public.credentials.update(
              {
                userId: user.id,
              },
              {
                isListed: false,
                updatedAt: new Date(),
              },
            )
            const existingCredential =
              await transaction.public.credentials.findOne({
                userId: user.id,
                description,
              })
            if (existingCredential) {
              await transaction.public.credentials.updateAndGetOne(
                {
                  id: existingCredential.id,
                },
                {
                  isListed: true,
                  updatedAt: new Date(),
                },
              )
            } else {
              await transaction.public.credentials.insertAndGet({
                userId: user.id,
                description,
                isListed: true,
              })
            }
          }
          await transaction.transactionCommit()
        } catch (e) {
          console.error('import testimonial', e, testimonial)
          await transaction.transactionRollback()
          throw new Error('api/unexpected')
        }
        progress++
        if (progress % 10 === 0 || progress < 2) {
          console.log(`processed ${progress}/${testimonials.length}`)
        }
        return 1
      },
      { concurrency: 10 },
    ).then(() => {
      console.log(`processed ${progress}/${testimonials.length}`)
    })
    return 1
  })
  .then(() => {
    console.log('then exit')
    process.exit()
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
