import Boom from '@hapi/boom'

import { config } from '#/config/config.js'

const getAuthToken = () => {
  const username = config.get('backendAuth.username')
  const password = config.get('backendAuth.password')
  return Buffer.from(`${username}:${password}`).toString('base64')
}

export async function callBackend(
  url,
  { method = 'GET', headers = {}, ...rest } = {}
) {
  const response = await fetch(url, {
    method,
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${getAuthToken()}`,
      ...headers
    }
  }).catch((error) => {
    const reason = error.cause?.code ?? error.cause?.message ?? error.message
    throw Boom.badGateway(`Backend request to ${url} failed: ${reason}`)
  })

  const json = await response.json().catch((e) => {
    console.warn(`Failed to parse JSON from ${url}:`, e.message)
    return {}
  })

  if (response.ok) return { response, json }

  throw Boom.boomify(new Error(json.message ?? 'Backend request failed'), {
    statusCode: response.status
  })
}
