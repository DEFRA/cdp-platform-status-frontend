export function init(el) {
  const pre = el.querySelector('pre')
  const btn = el.querySelector('button[data-copy]')

  btn?.addEventListener('click', () => {
    navigator.clipboard
      .writeText(pre?.textContent ?? '')
      .then(() => {
        btn.textContent = 'Copied!'
      })
      .catch(() => {
        btn.textContent = 'Copy failed'
      })
  })
}
