import { callBackendWithJwt } from '#/server/common/helpers/backend-client.js'
import { config } from '#/config/config.js'

function renderPage(h, viewModel = {}) {
  return h.view('sts/index', {
    pageTitle: 'STS Web Identity checker',
    heading: 'STS Web Identity Checker',
    breadcrumbs: [
      {
        text: 'Home',
        href: '/'
      },
      {
        text: 'sts'
      }
    ],
    ...viewModel
  })
}

export const tokenController = {
  async handler(request, h) {
    let response = {}
    try {
      response = await callBackendWithJwt(
        request,
        `${config.get('backendUrl')}/sts`
      )
      request.logger.info(response)
    } catch (err) {
      request.logger.error(err)
      response = 'Failed to get web identity token' + err.message
    }
    return renderPage(h, { token: response })
  }
}
