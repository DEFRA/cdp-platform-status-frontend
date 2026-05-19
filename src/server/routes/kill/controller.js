import { callBackend } from '#/server/common/helpers/backend-client.js'
import { config } from '#/config/config.js'

function renderPage(h, viewModel = {}) {
  return h.view('kill/index', {
    pageTitle: 'Kill switch',
    heading: 'Backend kill switch',
    breadcrumbs: [
      {
        text: 'Home',
        href: '/'
      },
      {
        text: 'Kill switch'
      }
    ],
    formValues: {
      type: 'exit',
      ...(viewModel.formValues ?? {})
    },
    ...viewModel
  })
}

export const killPageController = {
  handler(_request, h) {
    return renderPage(h)
  }
}

export const triggerKillController = {
  async handler(request, h) {
    const payload = request.payload ?? {}
    const requestPayload = {
      type: ['exit', 'sigterm', 'oom', 'health'].includes(payload.type)
        ? payload.type
        : 'exit'
    }

    try {
      const { json } = await callBackend(`${config.get('backendUrl')}/kill`, {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      })

      return renderPage(h, {
        successMessage: `Kill mode '${json.triggered}' triggered. Backend may restart shortly.`,
        formValues: requestPayload
      })
    } catch (error) {
      request.logger.error(error)
      return renderPage(h, {
        errorMessage: `Failed to trigger kill switch: ${error.message}`,
        formValues: requestPayload
      }).code(error.output?.statusCode ?? 500)
    }
  }
}
