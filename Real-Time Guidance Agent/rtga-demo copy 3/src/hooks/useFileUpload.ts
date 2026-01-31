import { useCallback } from 'react'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { useCallStateStore } from '@/stores/callStateStore'
import type { DemoScript } from '@/types/demo-script'

function validateDemoScript(data: unknown): data is DemoScript {
  if (!data || typeof data !== 'object') return false

  const script = data as Record<string, unknown>

  if (!script.metadata || typeof script.metadata !== 'object') return false
  if (!script.customer || typeof script.customer !== 'object') return false
  if (!script.conversation || !Array.isArray(script.conversation)) return false
  if (!script.workflow || typeof script.workflow !== 'object') return false

  const metadata = script.metadata as Record<string, unknown>
  if (typeof metadata.id !== 'string' || typeof metadata.name !== 'string') {
    return false
  }

  const customer = script.customer as Record<string, unknown>
  if (
    typeof customer.id !== 'string' ||
    typeof customer.name !== 'string' ||
    typeof customer.tier !== 'string'
  ) {
    return false
  }

  return true
}

export function useFileUpload() {
  const { setScript, setLoading, setError, clearScript } = useDemoScriptStore()
  const { reset: resetCallState, setPhase } = useCallStateStore()

  const processFile = useCallback(
    async (file: File) => {
      setLoading(true)
      setError(null)

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (!validateDemoScript(data)) {
          throw new Error('Invalid demo script format. Please check the JSON structure.')
        }

        resetCallState()
        setScript(data)
        setPhase('incoming')
      } catch (err) {
        if (err instanceof SyntaxError) {
          setError('Invalid JSON file. Please check the file format.')
        } else if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unexpected error occurred while processing the file.')
        }
      } finally {
        setLoading(false)
      }
    },
    [setScript, setLoading, setError, resetCallState, setPhase]
  )

  const loadSampleScript = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/sample-scripts/ananya-lost-card.json')
      if (!response.ok) {
        throw new Error('Failed to load sample script')
      }

      const data = await response.json()

      if (!validateDemoScript(data)) {
        throw new Error('Invalid demo script format in sample file.')
      }

      resetCallState()
      setScript(data)
      setPhase('incoming')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while loading the sample script.')
      }
    } finally {
      setLoading(false)
    }
  }, [setScript, setLoading, setError, resetCallState, setPhase])

  const resetDemo = useCallback(() => {
    clearScript()
    resetCallState()
  }, [clearScript, resetCallState])

  return {
    processFile,
    loadSampleScript,
    resetDemo,
  }
}
