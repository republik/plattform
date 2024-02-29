import { Branded } from '@orbiting/backend-modules-types'

export type Participation = 'AUTHOR' | 'TRANSLATOR' | 'IMAGE_ORIGINATOR'

export type Participant = {
  firstName: string
  surName: string
  internalIdentification?: string
  memberId?: string
  participation: Participation
}

export type MessageText = {
  pdfOrEpub?: string
  plainText?: string
}

export type ValidMessageText = Branded<MessageText, 'ValidMessageText'>

export type PixelUid = `vzm.${number}-${string}`

export type MessageRequest = {
  messageText: ValidMessageText
  participants: Participant[]
  pixelUid: PixelUid
  title: string
}

export type MessageResponse = {
  title: string
  pixelUid: PixelUid
  textLength: number
  participants: Participant[]
  createdAt: string
}

export type APIError = {
  code: number
  message: string
  fieldErrors?: {
    field: string
    message: string
  }[]
}

export const PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH = 4193040

export interface ProLitterisMessageService {
  makeMessage(msg: MessageRequest): Promise<MessageResponse | APIError | null>
}

export class ProLitterisAPI implements ProLitterisMessageService {
  #baseURL: string = 'https://owen.prolitteris.ch/'
  #authentication: string

  constructor(memberNr: number | string, username: string, password: string) {
    const auth = Buffer.from(`${memberNr}:${username}:${password}`).toString(
      'base64',
    )
    this.#authentication = `OWEN ${auth}`
  }

  async makeMessage(
    msg: MessageRequest,
  ): Promise<MessageResponse | APIError | null> {
    const res = await this.#doRequest('/rest/api/1/message', 'POST', msg)

    if (res && res.status === 200) {
      const json = await res.json()
      return {
        createdAt: json.createdAt,
        title: json.title,
        pixelUid: json.pixelUid,
        participants: json.participants,
        textLength: json.participants,
      }
    } else if (res && (res.status === 400 || res.status === 500)) {
      const error = (await res.json()).error
      return {
        code: error.code,
        message: error.message,
        fieldErrors: error?.fieldErrors,
      }
    }

    return null
  }

  async #doRequest(
    url: string,
    method: 'GET' | 'POST',
    data: any,
  ): Promise<Response | null> {
    try {
      const body = JSON.stringify(data)
      return fetch(this.#baseURL + url, {
        method: method,
        headers: {
          Authorization: this.#authentication,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: body,
      })
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

export function assertValidMessageText(
  messageText: MessageText,
): asserts messageText is ValidMessageText {
  if (
    messageText.plainText !== undefined &&
    messageText.pdfOrEpub !== undefined
  ) {
    throw Error(
      'invalid MessageText: must be one of plainText or pdfOrEpub but both were provided',
    )
  }

  if (messageText.plainText !== undefined) {
    if (!isBase64(messageText.plainText)) {
      throw Error(`invalid MessageText: plainText is not valid base64`)
    }

    if (messageText.plainText.length > PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH) {
      throw Error(
        `plainText exceeds max base64 text length of ${PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH} with ${messageText.plainText.length}`,
      )
    }
  }

  if (messageText.pdfOrEpub !== undefined) {
    if (!isBase64(messageText.pdfOrEpub)) {
      throw Error(`pdfOrEpub is not valid base64`)
    }

    if (messageText.pdfOrEpub.length > PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH) {
      throw Error(
        `pdfOrEpub exceeds max base64 text length of ${PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH}`,
      )
    }
  }
}

function isBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str
  } catch (err) {
    return false
  }
}
