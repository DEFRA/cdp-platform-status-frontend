import { GetWebIdentityTokenCommand, STSClient } from '@aws-sdk/client-sts'

const client = new STSClient()

function requestToken(aud) {
  const input = {
    SigningAlgorithm: 'RS256',
    Audience: [aud]
  }
  const command = new GetWebIdentityTokenCommand(input)
  return client.send(command)
}

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
  async handler(_request, h) {
    const aud = _request.query.aud ?? 'cdp-platform-status-frontend'
    let response = {}
    try {
      response = await requestToken(aud)
      _request.logger.info(response)
    } catch (err) {
      _request.logger.error(err)
      response = 'Failed to get web identity token' + err.message
    }
    return renderPage(h, { aud, token: response })
  }
}
