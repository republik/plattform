#!/usr/bin/env node

const { ProLitterisAPI } = require('@orbiting/backend-modules-prolitteris')

require('@orbiting/backend-modules-env').config()

async function main() {
  const PROLITTERIS_USER_NAME = process.env?.PROLITTERIS_USER_NAME
  if (!PROLITTERIS_USER_NAME) {
    console.error('ProLitteris Username not provied')
    process.exit(1)
  }
  const PROLITTERIS_PW = process.env?.PROLITTERIS_PW
  if (!PROLITTERIS_PW) {
    console.error('ProLitteris password is missing')
    process.exit(1)
  }
  const PROLITTERIS_MEMBER_ID = Number(process.env?.PROLITTERIS_MEMBER_ID)
  if (!PROLITTERIS_MEMBER_ID || isNaN(PROLITTERIS_MEMBER_ID)) {
    console.error('PROLITTERIS_MEMBER_ID is missing')
    process.exit(1)
  }

  const api = new ProLitterisAPI(
    PROLITTERIS_MEMBER_ID,
    PROLITTERIS_USER_NAME,
    PROLITTERIS_PW,
  )

  let start = 1
  let isLastPage = false
  const ids = []

  while (!isLastPage) {
    const res = await api.getPixelIds({
      startAt: start,
      minAccessReached: true,
    })
    if (res?.values) {
      for (const pixel of res.values) {
        ids.push(pixel.uid)
      }
      start = start + res.values.length
    }
    if (res.isLastPage) {
      isLastPage = true
    }
  }

  console.log(ids.join('\n'))
}

main()
