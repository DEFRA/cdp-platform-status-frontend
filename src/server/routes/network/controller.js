import { config } from '#/config/config.js'
import { callBackend } from '#/server/common/helpers/backend-client.js'

function renderPage(h, viewModel = {}) {
  return h.view('network/index', {
    pageTitle: 'Network check',
    heading: 'Network check',
    breadcrumbs: [
      {
        text: 'Home',
        href: '/'
      },
      {
        text: 'Network check'
      }
    ],
    httpUrl: '',
    dnsHostname: '',
    portHost: '',
    portPort: 443,
    ...viewModel
  })
}

async function handleHttpCheck(request, h) {
  const url = String(request.payload?.url ?? '').trim()

  if (!url) {
    return renderPage(h, {
      httpUrl: url,
      httpErrorMessage: 'Enter a URL'
    }).code(400)
  }

  const start = performance.now()

  try {
    const { json } = await callBackend(
      `${config.get('backendUrl')}/network/check`,
      { method: 'POST', body: JSON.stringify({ url }) }
    )

    return renderPage(h, {
      httpUrl: url,
      httpResult: {
        ...json,
        body: (json.body ?? '').trim(),
        headersText: Object.entries(json.headers ?? {})
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
        totalMs: Math.round(performance.now() - start)
      }
    })
  } catch (error) {
    request.logger.error(error)
    return renderPage(h, {
      httpUrl: url,
      httpErrorMessage: `HTTP check failed: ${error.message}`
    }).code(error.output?.statusCode ?? 500)
  }
}

async function handleDnsLookup(request, h) {
  const hostname = String(request.payload?.hostname ?? '').trim()

  if (!hostname) {
    return renderPage(h, {
      dnsHostname: hostname,
      dnsErrorMessage: 'Enter a hostname'
    }).code(400)
  }

  try {
    const { json } = await callBackend(
      `${config.get('backendUrl')}/network/dns`,
      { method: 'POST', body: JSON.stringify({ hostname }) }
    )

    return renderPage(h, {
      dnsHostname: hostname,
      dnsResult: json
    })
  } catch (error) {
    request.logger.error(error)
    return renderPage(h, {
      dnsHostname: hostname,
      dnsErrorMessage: `DNS lookup failed: ${error.message}`
    }).code(error.output?.statusCode ?? 500)
  }
}

async function handlePortCheck(request, h) {
  const host = String(request.payload?.host ?? '').trim()
  const port = parseInt(String(request.payload?.port ?? ''), 10)

  if (!host) {
    return renderPage(h, {
      portHost: host,
      portPort: port || 443,
      portErrorMessage: 'Enter a host'
    }).code(400)
  }

  try {
    const { json } = await callBackend(
      `${config.get('backendUrl')}/network/port`,
      { method: 'POST', body: JSON.stringify({ host, port }) }
    )

    return renderPage(h, {
      portHost: host,
      portPort: port,
      portResult: json
    })
  } catch (error) {
    request.logger.error(error)
    return renderPage(h, {
      portHost: host,
      portPort: port,
      portErrorMessage: `Port check failed: ${error.message}`
    }).code(error.output?.statusCode ?? 500)
  }
}

export const networkPageController = {
  handler(_request, h) {
    return renderPage(h)
  }
}

export const submitNetworkController = {
  async handler(request, h) {
    const checkType = String(request.payload?.checkType ?? 'http')

    if (checkType === 'http') return handleHttpCheck(request, h)
    if (checkType === 'dns') return handleDnsLookup(request, h)
    if (checkType === 'port') return handlePortCheck(request, h)

    return h.response({ error: 'unknown checkType' }).code(400)
  }
}
