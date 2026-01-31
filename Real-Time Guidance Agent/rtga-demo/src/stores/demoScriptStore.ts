import { create } from 'zustand'
import type { DemoScript } from '@/types/demo-script'

interface DemoScriptState {
  script: DemoScript | null
  isLoading: boolean
  error: string | null
  setScript: (script: DemoScript) => void
  clearScript: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDemoScriptStore = create<DemoScriptState>((set) => ({
  script: null,
  isLoading: false,
  error: null,
  setScript: (script) => set({ script, error: null }),
  clearScript: () => set({ script: null, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}))
