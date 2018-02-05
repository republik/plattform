const paymentSuccess = async () => {
  console.log(this)
}

const createTransaction = async (token) => {
  // const transactionDetails = {
  //   USER: process.env.PAYPAL_USER,
  //   PWD: process.env.PAYPAL_PWD,
  //   SIGNATURE: process.env.PAYPAL_SIGNATURE,
  //   METHOD: 'TransactionSearch',
  //   VERSION: '78',
  //   TRXTYPE: 'Q',
  //   STARTDATE: '2016-12-31',
  //   ENDDATE: '2017-12-31'
  // }
  // const form = querystring.stringify(transactionDetails)
  // const contentLength = form.length
  // const responseRaw = await fetch('https://api-3t.sandbox.paypal.com/nvp', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Length': contentLength,
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   },
  //   body: form
  // })
  // const transactionIds = await responseRaw.text()
  return {
    id: 'test'
  }
}

// see typesOfIntereset in webhookHandler.js
module.exports = {
  createTransaction,
  paymentSuccess
}
