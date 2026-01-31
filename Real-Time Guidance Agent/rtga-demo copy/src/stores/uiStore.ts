import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  soundEnabled: boolean
  activeRightPanel: 'workflow' | 'actions' | 'knowledge' | 'compliance'
  expandedKnowledgeId: string | null

  toggleSound: () => void
  setActiveRightPanel: (panel: UIState['activeRightPanel']) => void
  setExpandedKnowledgeId: (id: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      activeRightPanel: 'workflow',
      expandedKnowledgeId: null,

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),
      setExpandedKnowledgeId: (id) => set({ expandedKnowledgeId: id }),
    }),
    {
      name: 'rtga-ui-preferences',
      partialize: (state) => ({ soundEnabled: state.soundEnabled }),
    }
  )
)
