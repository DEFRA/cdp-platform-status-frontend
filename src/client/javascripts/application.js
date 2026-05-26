import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink
} from 'govuk-frontend'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)

const modules = {
  'status-dashboard': () => import('./status-dashboard.js'),
  'copy-text': () => import('./copy-text.js')
}

document.querySelectorAll('[data-module]').forEach((el) => {
  const load = modules[el.dataset.module]
  if (load) load().then((m) => m.init(el))
})
