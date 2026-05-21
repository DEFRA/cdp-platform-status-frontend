export const timeoutMs = 10_000

export function normalizeError(error) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export async function runWithTimeout(taskFn) {
  return Promise.race([
    taskFn(),
    new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    })
  ])
}
