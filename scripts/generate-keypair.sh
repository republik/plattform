#!/usr/bin/env node

let { generateKeyPair } = require('crypto');

generateKeyPair('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'secret'
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
  console.log(`Private key: ${b64PrivateKey}`);
});