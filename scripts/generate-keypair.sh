#!/usr/bin/env node

const { generateKeyPair } = require('crypto')

// alg: ES256
// @see https://datatracker.ietf.org/doc/html/rfc7518#section-3.1
generateKeyPair('ec', {
  namedCurve: 'prime256v1',
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  }
}, (err, publicKey, privateKey) => {
  // Handle errors and use the generated key pair.
  if (err) {
    console.error(err);
    return;
  }
  // Base64 encode the public and private keys.
  const b64PublicKey = Buffer.from(publicKey).toString('base64');
  const b64PrivateKey = Buffer.from(privateKey).toString('base64');

  console.log(`Public key: ${b64PublicKey}`);
  console.log('--')
  console.log(`Private key: ${b64PrivateKey}`);
});
