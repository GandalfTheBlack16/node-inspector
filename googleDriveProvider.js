import { createReadStream } from 'fs'
import { writeFile } from 'fs/promises'
import { google } from 'googleapis'
import path from 'path'

const loadProperties = () => {
  const privateKeyId = process.env.DRIVE_PRIVATE_KEY_ID
  const privateKey = process.env.DRIVE_PRIVATE_KEY
  const clientEmail = process.env.DRIVE_CLIENT_EMAIL
  const clientId = process.env.DRIVE_CLIENT_ID
  const clientCertUrl = process.env.DRIVE_CLIENT_CERT_URL

  if (privateKeyId == null) {
    throw new Error('Environment variable "DRIVE_PRIVATE_KEY_ID" is not defined')
  }
  if (privateKey == null) {
    throw new Error('Environment variable "DRIVE_PRIVATE_KEY" is not defined')
  }
  if (clientEmail == null) {
    throw new Error('Environment variable "DRIVE_CLIENT_EMAIL" is not defined')
  }
  if (clientId == null) {
    throw new Error('Environment variable "DRIVE_CLIENT_ID" is not defined')
  }
  if (clientCertUrl == null) {
    throw new Error('Environment variable "DRIVE_CLIENT_CERT_URL" is not defined')
  }

  return {
    privateKeyId,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    clientEmail,
    clientId,
    clientCertUrl
  }
}

export const uploadFile = async (filePath) => {
  const {
    privateKeyId,
    privateKey,
    clientEmail,
    clientId,
    clientCertUrl
  } = loadProperties()

  const credentialsContent = {
    type: 'service_account',
    project_id: 'password-manager-backup',
    private_key_id: privateKeyId,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: clientId,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: clientCertUrl,
    universe_domain: 'googleapis.com'
  }

  const credentialsPath = path.join('credentials.json')

  await writeFile(credentialsPath, JSON.stringify(credentialsContent), 'utf-8')

  const provider = google.drive({
    version: 'v3',
    auth: new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    })
  })

  const requestBody = {
    name: 'data.zip',
    mimeType: 'application/x-zip',
    parents: ['18VOL4V81A1TOkEceVsH6hi1Pd4xhduJX']
  }
  const media = {
    mimeType: 'application/x-zip',
    body: createReadStream(filePath)
  }

  const response = await provider.files.create({
    requestBody,
    media,
    fields: 'id'
  })

  console.log(response)
}
