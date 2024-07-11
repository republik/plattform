import { CustomerRepo } from './database/repo'
import { PaymentGateway } from './gateway/gateway'
import { ProjectRStripe, RepublikAGStripe } from './gateway/stripe'
import { Company } from './types'

const Gateway = new PaymentGateway(
  {
    project_r: ProjectRStripe,
    republik_ag: RepublikAGStripe,
  },
  {} as CustomerRepo,
)

type CustomerIds = {
  userId: string
  project_r: string
  republik_ag: string
}

const Companies: Company[] = ['project_r', 'republik_ag']

export async function createCustomer(
  email: string,
  userId: string,
): Promise<CustomerIds> {
  const tasks = Companies.map(async (c) => {
    const id = await Gateway.forCompany(c).createCustomer(email, userId)
    return { id: id, company: c }
  })
  const results = await Promise.allSettled(tasks)

  const ids: Record<Company, string> = {} as Record<Company, string>
  for (const result of results) {
    if (result.status === 'fulfilled') {
      ids[result.value.company] = result.value.id
    } else {
      throw Error(result.reason)
    }
  }

  return {
    userId: userId,
    project_r: ids.project_r,
    republik_ag: ids.republik_ag,
  }
}
