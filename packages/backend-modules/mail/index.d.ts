import { GraphqlContext } from '@orbiting/backend-modules-types'

type SendMailTemplateArgs = {
  to: string
  fromEmail: string
  fromName?: string
  subject: string
  templateName: string
  globalMergeVars: { name: string; content: string }[]
  attachments?: { type: string; name: string; content: string }[]
  mergeLanguage: string
}

export function sendMailTemplate(
  args: SendMailTemplateArgs,
  context: Partial<GraphqlContext>,
  log?: any,
): Promise<any[]>
