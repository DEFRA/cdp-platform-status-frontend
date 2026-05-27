export function init(el) {
  const textarea = el.querySelector('textarea')
  const copyBtn = el.querySelector('button[data-copy]')

  copyBtn?.addEventListener('click', () => {
    navigator.clipboard
      .writeText(textarea?.value ?? '')
      .then(() => {
        copyBtn.textContent = 'Copied!'
      })
      .catch(() => {
        copyBtn.textContent = 'Copy failed'
      })
  })
}
