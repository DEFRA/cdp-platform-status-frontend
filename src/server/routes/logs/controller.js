import { callBackend } from '#/server/common/helpers/backend-client.js'
import { config } from '#/config/config.js'

function toNumber(value, defaultValue) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

function renderPage(h, viewModel = {}) {
  return h.view('logs/index', {
    pageTitle: 'Large logs',
    heading: 'Large logs and audit testing',
    breadcrumbs: [
      {
        text: 'Home',
        href: '/'
      },
      {
        text: 'Large logs'
      }
    ],
    formValues: {
      size: 100,
      fill: 'A',
      count: 1,
      type: 'log',
      ...(viewModel.formValues ?? {})
    },
    ...viewModel
  })
}

export const logsPageController = {
  handler(_request, h) {
    return renderPage(h)
  }
}

export const generateLogsController = {
  async handler(request, h) {
    const payload = request.payload ?? {}
    const requestPayload = {
      size: toNumber(payload.size, 100),
      fill: String(payload.fill ?? 'A').slice(0, 1) || 'A',
      count: toNumber(payload.count, 1),
      type: payload.type === 'audit' ? 'audit' : 'log'
    }

    try {
      const { json } = await callBackend(`${config.get('backendUrl')}/logs`, {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      })

      return renderPage(h, {
        successMessage: `Generated ${json.generated} message(s) of ${json.sizeKb}KB (${json.type}).`,
        formValues: requestPayload
      })
    } catch (error) {
      request.logger.error(error)
      return renderPage(h, {
        errorMessage: `Failed to generate logs: ${error.message}`,
        formValues: requestPayload
      }).code(error.output?.statusCode ?? 500)
    }
  }
}
