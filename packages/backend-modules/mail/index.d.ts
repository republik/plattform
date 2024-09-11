type SendMailTemplateArgs = {
  to: string
  fromEmail: string
  fromName: string
  subject: string
  templateName: string
  globalMergeVars: { name: string; content: string }[]
  attachments: { type: string; name: string; content: string }[]
}

export function sendMailTemplate(args: SendMailTemplateArgs): Promise<any[]>
