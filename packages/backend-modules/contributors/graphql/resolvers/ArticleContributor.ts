import Auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'

export = {
  prolitterisId: (root: any, _args: never, _ctx: GraphqlContext) => {
    return root.prolitteris_id
  },
  prolitterisFirstname: (root: any, _args: never, _ctx: GraphqlContext) => {
    return root.prolitteris_first_name
  },
  prolitterisLastname: (root: any, _args: never, _ctx: GraphqlContext) => {
    return root.prolitteris_first_name
  },
  userId: (root: any, _args: never, _ctx: GraphqlContext) => {
    return root.user_id
  },
  shortBio: (root: any, _args: never, _ctx: GraphqlContext) => {
    return root.short_bio
  },
  gender: (root: any, _args: never, ctx: GraphqlContext) => {
    const hasGenderAccess = Auth.Roles.userIsInRoles(ctx.user, [
      'admin',
      'editor',
      'producer',
    ])

    if (hasGenderAccess) {
      return root.gender
    }
    return null
  },
}
