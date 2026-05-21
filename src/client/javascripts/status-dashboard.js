function renderCheck(result) {
  const isOk = result.status === 'ok'
  const ops = result.operations
  const isPartial = !isOk && ops && Object.values(ops).some((s) => s === 'ok')

  const tagClass = isOk
    ? 'govuk-tag--green'
    : isPartial
      ? 'govuk-tag--orange'
      : 'govuk-tag--red'
  const tagText = isOk ? 'UP' : isPartial ? 'DEGRADED' : 'DOWN'
  const tag = `<strong class="govuk-tag ${tagClass}">${tagText}</strong>`
  const hint = result.reason
    ? `<p class="govuk-hint govuk-!-margin-top-1">${result.reason}</p>`
    : ''
  const opsList = ops
    ? `<ul class="app-status-ops">${Object.entries(ops)
        .map(([op, state]) => {
          const colour = state === 'ok' ? 'govuk-tag--green' : 'govuk-tag--red'
          return `<li class="app-status-ops__item"><span class="app-status-ops__label">${op}</span><strong class="govuk-tag ${colour}">${state}</strong></li>`
        })
        .join('')}</ul>`
    : ''
  return tag + hint + opsList
}

function applyChecks(data) {
  Object.entries(data.checks).forEach(([name, result]) => {
    const el = document.querySelector(`[data-check="${name}"]`)
    if (el) {
      el.innerHTML = renderCheck(result)
    }
  })
}

function markAllDown(names) {
  names.forEach((name) => {
    const el = document.querySelector(`[data-check="${name}"]`)
    if (el) {
      el.innerHTML = '<strong class="govuk-tag govuk-tag--red">DOWN</strong>'
    }
  })
}

function fetchCheck(url, fallbackNames) {
  fetch(url)
    .then((r) => r.json())
    .then(applyChecks)
    .catch(() => markAllDown(fallbackNames))
}

export function init() {
  fetchCheck('/api/redis-status', ['redis'])
  fetchCheck('/api/backend-status', ['backend'])
  fetchCheck('/api/mongo-status', ['mongo'])
  fetchCheck('/api/squid-status', ['squid'])
  fetchCheck('/api/s3-status', ['s3'])
  fetchCheck('/api/sqs-status', ['sqs'])
  fetchCheck('/api/sns-status', ['sns'])
}
