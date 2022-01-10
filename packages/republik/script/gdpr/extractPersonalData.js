#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

/**
 * THIS SCRIPT IS A WORKING DRAFT
 */

const path = require('path')
const fs = require('fs')
const yargs = require('yargs')
const { pick, cloneDeep } = require('lodash')
const Promise = require('bluebird')

const { csvFormat } = require('d3-dsv')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')

const {
  findPublished,
} = require('@orbiting/backend-modules-search/lib/Documents')

const argv = yargs
  .option('userId', {
    alias: ['user', 'u'],
    require: true,
  })
  .option('destination', {
    alias: ['dest', 'd'],
    require: true,
    coerce: (input) => path.resolve(input),
  }).argv

const readMeExplanations = []
let fileCount = 0

const readableRows = (row) => {
  Object.keys(row).forEach((key) => {
    if (Array.isArray(row[key]) || typeof row[key] === 'object') {
      row[key] = JSON.stringify(row[key])
    }
  })

  return row
}

const save = async (destination, name, explanation, _rows = []) => {
  if (_rows.length === 0) {
    console.log(`"${name}" has no data`)
    return
  }

  fileCount++

  const filename = `${String(fileCount).padStart(2, '0')}-${name}.csv`
  readMeExplanations.push(`/${filename}:\n\n\t${explanation}`)

  console.log(path.resolve(destination, filename))

  /* const rows = _rows.length === 1
    ? Object.keys(_rows[0]).map(attribute => ({ attribute, value: _rows[0][attribute] }))
    : cloneDeep(_rows) */

  const rows = cloneDeep(_rows)

  fs.writeFileSync(
    path.resolve(destination, filename),
    csvFormat(rows.map(readableRows)),
  )
}

const saveReadMe = async (destination) => {
  fs.writeFileSync(
    path.resolve(destination, 'README.txt'),
    `================================
 EXPORT PERSONENBEZOGENER DATEN
================================

${readMeExplanations.join('\n\n')}

(Stand: ${new Date().toISOString()})
`,
  )
}

const getMetas = (repoIds, { elastic }) =>
  Promise.map(
    repoIds,
    async (repoId) => {
      console.log(`fetching "${repoId}"...`)
      const docs = await findPublished(elastic, repoId)

      if (docs.length === 0) {
        return false
      }

      const { meta } = docs[0]

      return meta
    },
    { concurrency: 2 },
  )

Promise.props({ pgdb: PgDb.connect(), elastic: Elasticsearch.connect() })
  .then(async (connections) => {
    const { userId, destination } = argv
    const { pgdb, elastic } = connections

    if (!(await fs.existsSync(destination))) {
      fs.mkdirSync(destination, { recursive: true })
    }

    /**
     * user
     */
    const user = await pgdb.public.users.findOne({
      id: userId,
      deletedAt: null,
    })

    if (!user) {
      throw new Error('User not found.')
    }

    const address = await pgdb.public.addresses.findOne({ id: user.addressId })

    await save(
      destination,
      'user',
      'grundlegende Informationen über ein Nutzerkonto, z. B. Name oder E-Mail-Adresse',
      [
        {
          ...pick(user, [
            'email',
            'firstName',
            'lastName',
            'birthday',
            'phoneNumber',
            'createdAt',
            'username',
            'hasPublicProfile',
            'portraitUrl',
            'statement',
            'isListed',
            'facebookId',
            'twitterHandle',
            'publicUrl',
            'biography',
            'pgpPublicKey',
            'phonenumberNote',
            'previewsSentAt',
            'defaultDiscussionNotificationOption',
            'discussionNotificationChannels',
            'preferredFirstFactor',
            'disclosures',
          ]),
          ...(address && {
            address_name: address.name,
            address_line1: address.line1,
            address_line2: address.line2,
            address_postalCode: address.postalCode,
            address_city: address.city,
            address_country: address.country,
            address_createdAt: address.createdAt,
          }),
        },
      ],
    )

    /**
     * accessGrants
     */

    // -granted
    const accessGrantsGranted = await pgdb.public.accessGrants.find({
      granterUserId: user.id,
    })

    if (accessGrantsGranted.length > 0) {
      const accessCampaigns = await pgdb.public.accessCampaigns.find({
        id: accessGrantsGranted.map(({ accessCampaignId }) => accessCampaignId),
      })

      await save(
        destination,
        'accessGrants-granted',
        'geteilte Republik-Zugänge an andere',
        accessGrantsGranted.map((grant) => {
          const campaign = accessCampaigns.find(
            (campaign) => campaign.id === grant.accessCampaignId,
          )

          return {
            accessCampaign_title: campaign.title,
            ...pick(grant, [
              'createdAt',
              'beginAt',
              'endAt',
              'revokedAt',
              'invalidatedAt',
              'followupAt',
              'beginBefore',
            ]),
          }
        }),
      )
    }

    // -claimed
    const accessGrantsClaimed = await pgdb.public.accessGrants.find({
      or: [{ recipientUserId: user.id }, { email: user.email }],
    })

    if (accessGrantsClaimed.length > 0) {
      const accessCampaigns = await pgdb.public.accessCampaigns.find({
        id: accessGrantsClaimed.map(({ accessCampaignId }) => accessCampaignId),
      })

      await save(
        destination,
        'accessGrants-claimed',
        'erhaltene und angenommene Republik-Zugänge von anderen',
        accessGrantsClaimed.map((grant) => {
          const campaign = accessCampaigns.find(
            (campaign) => campaign.id === grant.accessCampaignId,
          )

          return {
            accessCampaign_title: campaign.title,
            ...pick(grant, [
              'createdAt',
              'beginAt',
              'endAt',
              'invalidatedAt',
              'followupAt',
            ]),
          }
        }),
      )
    }

    /**
     * answers
     */
    const answers = await pgdb.public.answers.find({ userId: user.id })

    if (answers.length > 0) {
      const questionnaires = await pgdb.public.questionnaires.find({
        id: answers.map(({ questionnaireId }) => questionnaireId),
      })

      const questions = await pgdb.public.questions.find({
        id: answers.map(({ questionId }) => questionId),
      })

      await save(
        destination,
        'answers',
        'Antworten auf Fragebögen',
        answers.map((answer) => {
          const questionnaire = questionnaires.find(
            (questionnaire) => questionnaire.id === answer.questionnaireId,
          )
          const question = questions.find(
            (question) => question.id === answer.questionId,
          )

          return {
            questionnaire_slug: questionnaire.slug,
            question_text: question.text,
            ...pick(answer, ['createdAt', 'updatedAt', 'payload', 'submitted']),
          }
        }),
      )
    }

    /**
     * ballots
     */
    const ballots = await pgdb.public.ballots.find({ userId: user.id })

    if (ballots.length > 0) {
      const votings = await pgdb.public.votings.find({
        id: ballots.map(({ votingId }) => votingId),
      })

      const votingOptions = await pgdb.public.votingOptions.find({
        id: ballots.map(({ votingOptionId }) => votingOptionId),
      })

      await save(
        destination,
        'ballots',
        'eingelegte Stimmzettel bei Abstimmungen',
        ballots.map((ballot) => {
          const voting = votings.find((voting) => voting.id === ballot.votingId)
          const votingOption = votingOptions.find(
            (votingOption) => votingOption.id === ballot.votingOptionId,
          )

          return {
            voting_name: voting.name,
            voting_slug: voting.slug,
            ...(votingOption && {
              votingOption_name: votingOption.name,
              votingOption_label: votingOption.label,
            }),
            ...pick(ballot, ['createdAt']),
          }
        }),
      )
    }

    /**
     * cards
     */
    const cards = await pgdb.public.cards.find({ userId: user.id })

    if (cards.length > 0) {
      const cardGroups = await pgdb.public.cardGroups.find({
        id: cards.map(({ cardGroupId }) => cardGroupId),
      })

      const comments = await pgdb.public.comments.find({
        id: cards.map(({ commentId }) => commentId),
      })

      await save(
        destination,
        'cards',
        'Karten bei Produkte wie Wahltindär',
        cards.map((card) => {
          const cardGroup = cardGroups.find(
            (cardGroup) => cardGroup.id === card.cardGroupId,
          )
          const comment = comments.find(
            (comment) => comment.id === card.commentId,
          )

          return {
            ...pick(card, ['createdAt', 'updatedAt']),
            cardGroup_name: cardGroup.name,
            cardGroup_slug: cardGroup.slug,
            comment_content: comment && comment.content,
          }
        }),
      )
    }

    /**
     * collectionDocumentItems
     */
    const collectionDocumentItems = await pgdb.public.collectionDocumentItems.find(
      { userId: user.id },
    )

    if (collectionDocumentItems.length > 0) {
      const collections = await pgdb.public.collections.find({
        id: collectionDocumentItems.map(({ collectionId }) => collectionId),
      })

      const metas = await getMetas(
        collectionDocumentItems.map(({ repoId }) => repoId),
        { elastic },
      )

      await save(
        destination,
        'collectionDocumentItems',
        'Lesepositionen in Beiträgen und gesetzte Lesezeichen',
        collectionDocumentItems.map((collectionDocumentItem) => {
          const collection = collections.find(
            (collection) =>
              collection.id === collectionDocumentItem.collectionId,
          )
          const meta = metas.find(
            (meta) => meta.repoId === collectionDocumentItem.repoId,
          )

          return {
            collection_name: collection.name,
            ...(meta && {
              document_meta_title: meta.title,
              document_meta_path: meta.path,
            }),
            ...pick(collectionDocumentItem, [
              'data.max.data',
              'data.nodeId',
              'data.percentage',
              'createdAt',
              'updatedAt',
            ]),
          }
        }),
      )
    }

    /**
     * collectionMediaItems
     */
    const collectionMediaItems = await pgdb.public.collectionMediaItems.find({
      userId: user.id,
    })

    if (collectionMediaItems.length > 0) {
      const collections = await pgdb.public.collections.find({
        id: collectionMediaItems.map(({ collectionId }) => collectionId),
      })

      await save(
        destination,
        'collectionMediaItems',
        'Abspielpositionen von Multimediaelementen z. B. Video oder Audio',
        collectionMediaItems.map((collectionMediaItem) => {
          const collection = collections.find(
            (collection) => collection.id === collectionMediaItem.collectionId,
          )

          return {
            collection_name: collection.name,
            ...pick(collectionMediaItem, [
              'mediaId',
              'data.max.data',
              'data.secs',
              'data.percentage',
              'createdAt',
              'updatedAt',
            ]),
          }
        }),
      )
    }

    /**
     * comments
     */

    // -posted

    const commentsPosted = await pgdb.public.comments.find({ userId: user.id })

    if (commentsPosted.length > 0) {
      const discussions = await pgdb.public.discussions.find({
        id: commentsPosted.map(({ discussionId }) => discussionId),
      })
      const discussionPreferences = await pgdb.public.discussionPreferences.find(
        { discussionId: discussions.map(({ id }) => id) },
      )
      const credentials = await pgdb.public.credentials.find({
        id: discussionPreferences.map(({ credentialId }) => credentialId),
      })

      await save(
        destination,
        'comments-posted',
        'verfasste Kommentare',
        commentsPosted.map((comment) => {
          const discussion = discussions.find(
            (discussion) => discussion.id === comment.discussionId,
          )
          const discussionPreference = discussionPreferences.find(
            (discussionPreference) =>
              discussionPreference.discussionId === discussion.id &&
              discussionPreference.userId === user.id,
          )
          const credential =
            discussionPreference &&
            credentials.find(
              (credential) =>
                credential.id === discussionPreference.credentialId,
            )

          return {
            discussion_title: discussion.title,
            discussion_path: discussion.path,
            ...pick(comment, [
              'createdAt',
              'updatedAt',
              'content',
              'upVotes',
              'downVotes',
              'published',
              'tags',
            ]),
            discussionPreference_anonymous:
              discussionPreference && discussionPreference.anonymous,
            discussionPreference_notificationOption:
              discussionPreference && discussionPreference.notificationOption,
            credential_description: credential && credential.description,
          }
        }),
      )
    }

    // -voted
    const commentsVoted = await pgdb.query(
      `
    SELECT c.*, v.vote
    FROM comments c, jsonb_to_recordset(c.votes) as v("userId" uuid, "vote" int)
    WHERE v."userId" = :userId
  `,
      {
        userId: user.id,
      },
    )

    if (commentsVoted.length > 0) {
      const discussions = await pgdb.public.discussions.find({
        id: commentsVoted.map(({ discussionId }) => discussionId),
      })

      await save(
        destination,
        'comments-voted',
        'Kommentare, bei denen über das Nutzerkonto ein Up-Vote (1) oder Down-Vote (-1) abgegeben wurde',
        commentsVoted.map((comment) => {
          const discussion = discussions.find(
            (discussion) => discussion.id === comment.discussionId,
          )

          return {
            discussion_title: discussion.title,
            discussion_path: discussion.path,
            ...pick(comment, ['content', 'vote']),
          }
        }),
      )
    }

    // -reported
    const commentsReported = await pgdb.query(
      `
    SELECT c.*, r."reportedAt"
    FROM comments c, jsonb_to_recordset(c.reports) as r("userId" uuid, "reportedAt" timestamp with time zone)
    WHERE r."userId" = :userId
  `,
      {
        userId: user.id,
      },
    )

    if (commentsReported.length > 0) {
      const discussions = await pgdb.public.discussions.find({
        id: commentsReported.map(({ discussionId }) => discussionId),
      })

      await save(
        destination,
        'comments-reported',
        'Kommentare, die über das Nutzerkonto gemeldet wurden',
        commentsReported.map((comment) => {
          const discussion = discussions.find(
            (discussion) => discussion.id === comment.discussionId,
          )

          return {
            discussion_title: discussion.title,
            discussion_path: discussion.path,
            ...pick(comment, ['content', 'reportedAt']),
          }
        }),
      )
    }

    /**
     * consents
     */
    const consents = await pgdb.public.consents.find({ userId: user.id })
    await save(
      destination,
      'consents',
      'verschiedenen Einverständniserklärungen und deren Rücknahme z. B. Datenschutz oder AGB',
      consents.map((consent) =>
        pick(consent, ['policy', 'ip', 'record', 'createdAt']),
      ),
    )

    /**
     * credentials
     */
    const credentials = await pgdb.public.credentials.find({ userId: user.id })
    await save(
      destination,
      'credentials',
      'erfasste Rollen',
      credentials.map((credential) =>
        pick(credential, [
          'description',
          'isListed',
          'verified',
          'createdAt',
          'updatedAt',
        ]),
      ),
    )

    /**
     * devices
     */
    const devices = await pgdb.public.devices.find({ userId: user.id })
    await save(
      destination,
      'devices',
      'angemeldete Geräte',
      devices.map((device) =>
        pick(device, ['information', 'createdAt', 'updatedAt']),
      ),
    )

    /**
     * electionBallots
     */
    const electionBallots = await pgdb.public.electionBallots.find({
      userId: user.id,
    })

    if (electionBallots.length > 0) {
      const elections = await pgdb.public.elections.find({
        id: electionBallots.map(({ electionId }) => electionId),
      })

      const electionCandidacies = await pgdb.public.electionCandidacies.find({
        id: electionBallots.map(({ candidacyId }) => candidacyId),
      })

      if (electionCandidacies.length > 0) {
        const candidacyUsers = await pgdb.public.users.find({
          id: electionCandidacies.map(({ userId }) => userId),
        })

        const candidacyComments = await pgdb.public.comments.find({
          id: electionCandidacies.map(({ commentId }) => commentId),
        })

        electionCandidacies.forEach((cancidacy, index) => {
          electionCandidacies[index]._user = candidacyUsers.find(
            (candidacyUser) => candidacyUser.id === cancidacy.userId,
          )
          electionCandidacies[index]._comment = candidacyComments.find(
            (candidacyComment) => candidacyComment.id === cancidacy.commentId,
          )
        })
      }

      await save(
        destination,
        'electionBallots',
        'eingelegte Stimmzettel bei Wahlen',
        electionBallots.map((electionBallot) => {
          const election = elections.find(
            (election) => election.id === electionBallot.electionId,
          )
          const electionCandidacy = electionCandidacies.find(
            (electionCandidacy) =>
              electionCandidacy.id === electionBallot.candidacyId,
          )

          return {
            election_description: election.description,
            election_slug: election.slug,
            ...pick(electionBallot, ['createdAt']),
            electionCandidacy_user_name:
              electionCandidacy &&
              [
                electionCandidacy._user.firstName,
                electionCandidacy._user.lastName,
              ]
                .filter(Boolean)
                .join(' '),
            electionCandidacy_comment_content:
              electionCandidacy && electionCandidacy._comment.content,
          }
        }),
      )
    }

    /**
     * mailLog
     */
    const mailLog = await pgdb.public.mailLog.find({
      or: [{ userId: user.id }, { email: user.email }],
    })

    await save(
      destination,
      'mailLog',
      'versendete Transaktions-E-Mails',
      mailLog.map((row) => pick(row, ['createdAt', 'type', 'status'])),
    )

    /**
     * membershipPeriods, membershipCancellations, chargeAttempts
     */

    const memberships = await pgdb.public.memberships.find({ userId: user.id })

    if (memberships.length > 0) {
      const membershipPeriods = await pgdb.public.membershipPeriods.find({
        membershipId: memberships.map(({ id }) => id),
      })

      const membershipTypes = await pgdb.public.membershipTypes.find({
        id: memberships.map(({ membershipTypeId }) => membershipTypeId),
      })

      await save(
        destination,
        'memberships',
        'Mitgliedschaften, Abonnements und deren Laufzeitabschnitte',
        membershipPeriods.map((membershipPeriod) => {
          const membership = memberships.find(
            (membership) => membership.id === membershipPeriod.membershipId,
          )
          const membershipType = membershipTypes.find(
            (membershipType) =>
              membershipType.id === membership.membershipTypeId,
          )

          return {
            membershipType_name: membershipType.name,
            sequenceNumber: membership.sequenceNumber,
            createdAt: membership.createdAt,
            membershipPeriod_beginDate: membershipPeriod.beginDate,
            membershipPeriod_endDate: membershipPeriod.endDate,
            membershipPeriod_createdAt: membershipPeriod.createdAt,
            autoPay: membership.autoPay,
          }
        }),
      )

      const membershipCancellations = await pgdb.public.membershipCancellations.find(
        { membershipId: memberships.map(({ id }) => id) },
      )

      await save(
        destination,
        'memberships-cancellations',
        'Kündigungen von Mitgliedschaften',
        membershipCancellations.map((cancellation) =>
          pick(cancellation, ['createdAt', 'revokedAt', 'category', 'reason']),
        ),
      )

      const chargeAttempts = await pgdb.public.chargeAttempts.find({
        membershipId: memberships.map(({ id }) => id),
      })

      await save(
        destination,
        'memberships-chargeAttempts',
        'automatische Abbuchungsvorgänge',
        chargeAttempts.map((attempt) =>
          pick(attempt, ['createdAt', 'total', 'status']),
        ),
      )
    }

    /**
     * pledges
     */

    const pledges = await pgdb.public.pledges.find({ userId: user.id })

    if (pledges.length > 0) {
      const packages = await pgdb.public.packages.find({
        id: pledges.map(({ packageId }) => packageId),
      })

      const pledgeOptions = await pgdb.public.pledgeOptions.find({
        pledgeId: pledges.map(({ id }) => id),
      })

      const packageOptions = await pgdb.public.packageOptions.find({
        id: pledgeOptions.map(({ templateId }) => templateId),
      })

      const membershipRewards = await pgdb.public.membershipTypes.find({
        rewardId: packageOptions.map(({ rewardId }) => rewardId),
      })

      const goodieRewards = await pgdb.public.goodies.find({
        rewardId: packageOptions.map(({ rewardId }) => rewardId),
      })

      await save(
        destination,
        'pledges',
        'gekaufte Produkte',
        pledgeOptions.map((pledgeOption) => {
          const packageOption = packageOptions.find(
            (packageOption) => packageOption.id === pledgeOption.templateId,
          )
          const membershipReward = membershipRewards.find(
            (reward) => reward.rewardId === packageOption.rewardId,
          )
          const goodieReward = goodieRewards.find(
            (reward) => reward.rewardId === packageOption.rewardId,
          )
          const pledge = pledges.find(
            (pledge) => pledge.id === pledgeOption.pledgeId,
          )
          const package_ = packages.find(
            (package_) => package_.id === pledge.packageId,
          )

          return {
            reward__type:
              (membershipReward && membershipReward.rewardType) ||
              (goodieReward && goodieReward.rewardType),
            reward__name:
              (membershipReward && membershipReward.name) ||
              (goodieReward && goodieReward.name),
            ...pick(pledgeOption, [
              'createdAt',
              'price',
              'amount',
              'periods',
              'total',
            ]),
            package_name: package_.name,
            pledge_donation: pledge.donation,
            pledge_total: pledge.total,
            pledge_status: pledge.status,
            pledge_reason: pledge.reason,
            pledge_messageToClaimers: pledge.messageToClaimers,
          }
        }),
      )
    }

    /**
     * payments
     */

    const pledgePayments = await pgdb.public.pledgePayments.find({
      pledgeId: pledges.map(({ id }) => id),
    })
    const payments = await pgdb.public.payments.find({
      id: pledgePayments.map(({ paymentId }) => paymentId),
    })

    await save(
      destination,
      'payments',
      'Zahlungen',
      payments.map((payment) => {
        return pick(payment, [
          'createdAt',
          'updatedAt',
          'method',
          'total',
          'status',
          'dueDate',
          'remindersSentAt',
          'type',
        ])
      }),
    )

    /**
     * tokens
     */

    const tokens = await pgdb.public.tokens.find({ email: user.email })
    await save(
      destination,
      'tokens',
      'ausgehändigte «Token» um sich bei der Republik einzuloggen',
      tokens.map((token) =>
        pick(token, [
          'createdAt',
          'context',
          'type',
          'email',
          'expiresAt',
          'expireAction',
        ]),
      ),
    )

    /**
     * sessions
     */

    const sessions = await pgdb.query(
      `
    SELECT
      s.*
    FROM
      "sessions" s
    WHERE
      sess->>'email' = :email OR
      sess->'passport'->>'user' = :userId
  `,
      {
        email: user.email,
        userId: user.id,
      },
    )
    await save(
      destination,
      'sessions',
      'aktive Sitzungen',
      sessions.map((session) => pick(session, ['expire', 'sess'])),
    )

    /**
     * subscriptions
     */

    const subscriptions = await pgdb.public.subscriptions.find({
      userId: user.id,
    })
    await save(
      destination,
      'subscriptions',
      'gewünschte Benachrichtungen',
      subscriptions.map((subscription) =>
        pick(subscription, ['createdAt', 'active', 'objectType']),
      ),
    )

    /**
     * notifications
     */

    const notifications = await pgdb.public.notifications.find({
      userId: user.id,
    })
    await save(
      destination,
      'notifications',
      'versendete Benachrichtungen',
      notifications.map((notification) =>
        pick(notification, [
          'createdAt',
          'eventObjectType',
          'channels',
          'readAt',
        ]),
      ),
    )

    await saveReadMe(destination)

    return connections
  })
  .then(async (connections) => {
    const { pgdb, elastic } = connections
    await pgdb.close()
    await elastic.close()
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
