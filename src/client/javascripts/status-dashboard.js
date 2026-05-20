function renderCheck(result) {
  const isOk = result.status === 'ok'
  const tag = `<strong class="govuk-tag ${isOk ? 'govuk-tag--green' : 'govuk-tag--red'}">${isOk ? 'UP' : 'DOWN'}</strong>`
  const hint = result.reason
    ? `<p class="govuk-hint govuk-!-margin-top-1">${result.reason}</p>`
    : ''
  return tag + hint
}

function applyChecks(data) {
  Object.entries(data.checks).forEach(([name, result]) => {
    const el = document.querySelector(`[data-check="${name}"]`)
    if (el) el.innerHTML = renderCheck(result)
  })
}

function markAllDown(names) {
  names.forEach((name) => {
    const el = document.querySelector(`[data-check="${name}"]`)
    if (el)
      {el.innerHTML = '<strong class="govuk-tag govuk-tag--red">DOWN</strong>'}
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
}
