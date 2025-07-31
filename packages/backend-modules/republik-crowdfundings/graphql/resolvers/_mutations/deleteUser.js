const { Roles } = require('@orbiting/backend-modules-auth')
const { transformUser } = require('@orbiting/backend-modules-auth')

const {
  publishMonitor,
} = require('@orbiting/backend-modules-republik/lib/slack')
const deleteStripeCustomer = require('../../../lib/payments/stripe/deleteCustomer')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const deleteRelatedData = async (
  { id: userId },
  hasPledges,
  hasInvoices,
  hasOrders,
  hasClaimedMemberships,
  unpublishComments,
  pgdb,
) => {
  // get all related tables
  // https://stackoverflow.com/questions/5347050/sql-to-list-all-the-tables-that-reference-a-particular-column-in-a-table
  const keepRelations = [
    'public.accessGrants',
    'public.electionCandidacies',
    'public.pledges',
    'payments.invoices',
    'payments.orders',
    'public.stripeCustomers',
    'payments.stripeCustomers',
    'public.comments', // get nullified, see below
  ]
  if (hasPledges || hasClaimedMemberships) {
    keepRelations.push('public.memberships')
  }
  if (hasInvoices || hasOrders) {
    keepRelations.push('payments.subscriptions')
  }
  const relations = await pgdb
    .query(
      `
    select
      R.TABLE_SCHEMA as schema,
      R.TABLE_NAME as table,
      R.column_name AS column
    from INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE u
    inner join INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS FK
      on U.CONSTRAINT_CATALOG = FK.UNIQUE_CONSTRAINT_CATALOG
      and U.CONSTRAINT_SCHEMA = FK.UNIQUE_CONSTRAINT_SCHEMA
      and U.CONSTRAINT_NAME = FK.UNIQUE_CONSTRAINT_NAME
    inner join INFORMATION_SCHEMA.KEY_COLUMN_USAGE R
      on R.CONSTRAINT_CATALOG = FK.CONSTRAINT_CATALOG
      and R.CONSTRAINT_SCHEMA = FK.CONSTRAINT_SCHEMA
      and R.CONSTRAINT_NAME = FK.CONSTRAINT_NAME
    where
      U.TABLE_NAME = 'users'
  `,
    )
    .then((rels) =>
      rels.filter(
        (rel) =>
          keepRelations.indexOf(rel.schema.concat('.', rel.table)) === -1,
      ),
    )
  relations.unshift({
    // needs to be first
    schema: 'public',
    table: 'discussionPreferences',
    column: 'userId',
  })
  return Promise.all([
    pgdb.query(
      `
      DELETE
        FROM sessions s
      WHERE
        ARRAY[(s.sess #>> '{passport, user}')::uuid] && :userIds
    `,
      {
        userIds: [userId],
      },
    ),
    // pull user from comments.votes, leaving upVotes, downVotes untouched
    pgdb.query(
      `
      UPDATE comments
        SET votes = COALESCE(NULLIF(sub.votes,'[{}]'::jsonb), '[]'::jsonb) -- remove empty objects {}
        FROM (
          SELECT id, jsonb_agg(v) AS votes
          FROM   (SELECT id, votes FROM comments WHERE votes::text LIKE :userIdPattern) c,
                 jsonb_array_elements(
                   CASE
                     WHEN jsonb_array_length(votes) = 1 -- if the id is the only entry in the array, add an empty object
                     THEN votes || '{}'::jsonb
                     ELSE votes
                   END
                 ) AS v -- LATERAL JOIN
          WHERE  v->>'userId' <> :userId OR v = '{}'
          GROUP  BY 1
        ) sub
      WHERE comments.id = sub.id
    `,
      {
        userIdPattern: `%${userId}%`,
        userId,
      },
    ),
    // nullify comments
    pgdb.public.comments.update(
      { userId },
      {
        userId: null,
        ...(unpublishComments
          ? {
              published: false,
              content: null,
            }
          : {}),
      },
    ),
    ...relations.map((rel) =>
      pgdb[rel.schema][rel.table].delete({
        [rel.column]: userId,
      }),
    ),
  ])
}

const getNulledColumnsForUsers = async (pgdb) => {
  const keepColumns = [
    'firstName',
    'lastName',
    'addressId',
    'createdAt',
    'updatedAt',
    'deletedAt',
  ]
  return pgdb
    .queryOneColumn(
      `
    SELECT
      column_name
    FROM information_schema.columns
    WHERE
      table_name = 'users' AND
      is_nullable = 'YES'
  `,
    )
    .then((columns) =>
      columns
        .filter((column) => keepColumns.indexOf(column) === -1)
        .reduce(
          (acc, column) => ({
            ...acc,
            [column]: null,
          }),
          {},
        ),
    )
}

module.exports = async (_, args, context) => {
  const { userId, unpublishComments = false } = args
  const {
    pgdb,
    req,
    t,
    mail: { deleteEmail: deleteFromMailchimp },
  } = context
  Roles.ensureUserHasRole(req.user, 'admin')
  if (req.user.id === userId) {
    throw new Error(t('api/users/delete/deleteYourselfNotSupported'))
  }

  const transaction = await pgdb.transactionBegin()
  try {
    const user = await transaction.public.users.findOne({
      id: userId,
    })
    if (!user) {
      throw new Error(t('api/users/404'))
    }

    const hasActiveMembershipOrSubscription = await hasUserActiveMembership(
      user,
      transaction,
    )
    if (hasActiveMembershipOrSubscription) {
      throw new Error(
        t('api/users/delete/deleteWithActiveMembershipNotSupported'),
      )
    }

    const pledges = await transaction.public.pledges.find({
      userId,
    })
    const hasPledges = pledges.length > 0
    const memberships = await transaction.query(
      `
      SELECT
        m.*,
        json_agg(p.*) as pledges
      FROM memberships m
      JOIN pledges p
        ON m."pledgeId" = p.id
      WHERE
        m."userId" = :userId
      GROUP BY
        m.id
    `,
      {
        userId,
      },
    )
    const claimedMemberships = memberships.filter(
      (m) => !!m.pledges.find((p) => p.userId !== userId),
    )

    const hasClaimedMemberships = claimedMemberships.length > 0

    const invoices = await transaction.payments.invoices.find({ userId })
    const hasInvoices = invoices.length > 0

    const orders = await transaction.payments.orders.find({ userId })
    const hasOrders = orders.length > 0

    const grants = await transaction.public.accessGrants.find({
      or: [{ granterUserId: userId }, { recipientUserId: userId }],
    })
    const hasGrants = grants.length > 0

    const candidacies = await transaction.public.electionCandidacies.find({
      userId,
    })
    const hasCandidacies = candidacies.length > 0

    // delete from mailchimp
    const mailchimpResult = await deleteFromMailchimp({
      email: user.email,
    })
    if (!mailchimpResult.every((result) => result === true)) {
      context.logger.warn(
        {
          userId: user.id,
        },
        `deleteUser: could not delete ${user.email} from all mailchimp audiences. This might be because they were not added to all currently used audiences.`,
      )
    }

    await deleteRelatedData(
      user,
      hasPledges,
      hasInvoices,
      hasOrders,
      hasClaimedMemberships,
      unpublishComments,
      transaction,
    )

    // if the user doesn't have pledges, nor grants, nor candidacies we can delete everything,
    // otherwise we need to keep (firstName, lastName, address) for bookkeeping
    if (
      !hasPledges &&
      !hasInvoices &&
      !hasGrants &&
      !hasCandidacies &&
      !hasClaimedMemberships
    ) {
      // delete stripe data
      await deleteStripeCustomer({ userId, pgdb: transaction })

      await transaction.public.users.deleteOne({
        id: userId,
      })
    } else {
      // null profile where possible
      // change email to uid_deleted@republik.ch
      const nulledColumns = await getNulledColumnsForUsers(transaction)
      await transaction.public.users.updateOne(
        {
          id: userId,
        },
        {
          email: `${user.id}_deleted@republik.ch`,
          hasPublicProfile: false,
          isListed: false,
          isAdminUnlisted: true,
          deletedAt: new Date(),
          ...nulledColumns,
        },
      )
    }

    await transaction.transactionCommit()

    await publishMonitor(
      req.user,
      `deleteUser *${user.firstName} ${user.lastName} - ${user.email}*`,
    )

    return hasPledges ||
      hasInvoices ||
      hasGrants ||
      hasCandidacies ||
      hasClaimedMemberships
      ? transformUser(
          await pgdb.public.users.findOne({
            id: userId,
          }),
        )
      : null
  } catch (e) {
    await transaction.transactionRollback()
    context.logger.error({ args, error: e }, 'delete user failed')
    throw e
  }
}
