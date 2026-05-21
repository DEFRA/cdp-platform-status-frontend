import { vi } from 'vitest'
import { runWithTimeout, timeoutMs } from './helpers.js'

describe('#runWithTimeout', () => {
  test('Should resolve with the task result when task completes in time', async () => {
    const result = await runWithTimeout(async () => 'done')
    expect(result).toBe('done')
  })

  test('Should reject when the task throws', async () => {
    await expect(
      runWithTimeout(async () => {
        throw new Error('task failed')
      })
    ).rejects.toThrow('task failed')
  })

  test('Should reject with timeout error when task exceeds timeoutMs', async () => {
    vi.useFakeTimers()

    const promise = runWithTimeout(
      () => new Promise(() => {}) // never resolves
    )

    vi.advanceTimersByTime(timeoutMs)

    await expect(promise).rejects.toThrow(`Timed out after ${timeoutMs}ms`)

    vi.useRealTimers()
  })
})
