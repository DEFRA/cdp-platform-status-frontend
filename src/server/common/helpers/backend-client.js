import Boom from '@hapi/boom'

import { config } from '#/config/config.js'

export async function callBackend(url, options = {}) {
  const username = config.get('backendAuth.username')
  const password = config.get('backendAuth.password')
  const token = Buffer.from(`${username}:${password}`).toString('base64')

  const response = await fetch(url, {
    ...options,
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
      ...(options.headers ?? {})
    }
  })

  let json = {}

  try {
    json = await response.json()
  } catch {
    json = {}
  }

  if (response.ok) {
    return { response, json }
  }

  throw Boom.boomify(new Error(json.message ?? 'Backend request failed'), {
    statusCode: response.status
  })
}
