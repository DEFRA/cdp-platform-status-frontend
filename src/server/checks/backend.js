import { config } from '#/config/config.js'
import { callBackend } from '#/server/common/helpers/backend-client.js'
import { normalizeError } from '#/server/checks/helpers.js'

export async function checkBackend(request) {
  try {
    await callBackend(`${config.get('backendUrl')}/health`)
    return { status: 'ok' }
  } catch (error) {
    request.logger.error({ err: error }, 'Backend connectivity check failed')
    return { status: 'fail', reason: normalizeError(error) }
  }
}

async function fetchBackendCheck(request, backendPath) {
  try {
    const { json } = await callBackend(
      `${config.get('backendUrl')}${backendPath}`
    )
    return json.checks ?? {}
  } catch (error) {
    request.logger.error(
      { err: error, backendPath },
      'Backend status check failed'
    )
    return null
  }
}

export function makeBackendCheckController(backendPath, checkKey) {
  return {
    async handler(request, h) {
      const checks = await fetchBackendCheck(request, backendPath)
      return h.response({
        checks: {
          [checkKey]: checks
            ? (checks[checkKey] ?? {
                status: 'fail',
                reason: `Missing ${checkKey} check`
              })
            : { status: 'fail', reason: 'Backend unreachable' }
        }
      })
    }
  }
}
