import { vi } from 'vitest'
import { normalizeError, runWithTimeout, timeoutMs } from './helpers.js'

describe('#normalizeError', () => {
  test('Should return message when given an Error', () => {
    expect(normalizeError(new Error('something broke'))).toBe('something broke')
  })

  test('Should stringify non-Error values', () => {
    expect(normalizeError('plain string')).toBe('plain string')
    expect(normalizeError(42)).toBe('42')
  })
})

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
