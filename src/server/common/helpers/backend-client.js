import Boom from '@hapi/boom'

import { config } from '#/config/config.js'
import { createLogger } from '#/server/common/helpers/logging/logger.js'
import { GetWebIdentityTokenCommand } from '@aws-sdk/client-sts'

const logger = createLogger()

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
    logger.warn({ url, err: e }, 'Failed to parse JSON response from backend')
    return {}
  })

  if (response.ok) return { response, json }

  throw Boom.boomify(new Error(json.message ?? 'Backend request failed'), {
    statusCode: response.status
  })
}

const getJwtToken = async (stsClient) => {
  const input = {
    SigningAlgorithm: 'RS256',
    Audience: ['cdp-platform-status-backend'],
    DurationSeconds: 300
  }
  const command = new GetWebIdentityTokenCommand(input)
  const { WebIdentityToken, Expiration } = await stsClient.send(command)
  logger.info(`Requested new web identity token, expires at ${Expiration}`)
  return WebIdentityToken
}

export async function callBackendWithJwt(
  sts,
  url,
  { method = 'GET', headers = {}, ...rest } = {}
) {
  // TODO: consider caching the token
  const token = await getJwtToken(sts)
  const response = await fetch(url, {
    method,
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers
    }
  }).catch((error) => {
    const reason = error.cause?.code ?? error.cause?.message ?? error.message
    throw Boom.badGateway(`Backend request to ${url} failed: ${reason}`)
  })

  const json = await response.json().catch((e) => {
    logger.warn(`Failed to parse JSON response from backend ${url}: ${e}`)
    return {}
  })

  if (response.ok) return { response, json }

  throw Boom.boomify(new Error(json.message ?? 'Backend request failed'), {
    statusCode: response.status
  })
}
