import { create } from 'zustand'
import type {
  CallPhase,
  ConversationMessage,
  WorkflowStep,
  Action,
  KnowledgeArticle,
  ComplianceRule,
  DispositionCode,
} from '@/types/demo-script'

interface CallState {
  phase: CallPhase
  currentMessageIndex: number
  displayedMessages: ConversationMessage[]
  isTyping: boolean
  typingSpeaker: 'customer' | 'agent' | null

  workflowSteps: WorkflowStep[]
  visibleActions: Action[]
  visibleKnowledge: KnowledgeArticle[]
  activeComplianceAlerts: ComplianceRule[]

  callStartTime: Date | null
  callEndTime: Date | null
  selectedDisposition: DispositionCode | null

  setPhase: (phase: CallPhase) => void
  advanceMessage: () => void
  addDisplayedMessage: (message: ConversationMessage) => void
  setTyping: (isTyping: boolean, speaker?: 'customer' | 'agent' | null) => void

  setWorkflowSteps: (steps: WorkflowStep[]) => void
  updateWorkflowStep: (stepId: string, status: WorkflowStep['status']) => void

  showAction: (action: Action) => void
  completeAction: (actionId: string) => void

  showKnowledge: (article: KnowledgeArticle) => void
  hideKnowledge: (articleId: string) => void

  showComplianceAlert: (rule: ComplianceRule) => void
  acknowledgeComplianceAlert: (ruleId: string) => void

  startCall: () => void
  endCall: () => void
  setDisposition: (disposition: DispositionCode) => void

  reset: () => void
}

const initialState = {
  phase: 'idle' as CallPhase,
  currentMessageIndex: -1,
  displayedMessages: [],
  isTyping: false,
  typingSpeaker: null,
  workflowSteps: [],
  visibleActions: [],
  visibleKnowledge: [],
  activeComplianceAlerts: [],
  callStartTime: null,
  callEndTime: null,
  selectedDisposition: null,
}

export const useCallStateStore = create<CallState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  advanceMessage: () => set((state) => ({
    currentMessageIndex: state.currentMessageIndex + 1,
  })),

  addDisplayedMessage: (message) => set((state) => ({
    displayedMessages: [...state.displayedMessages, message],
  })),

  setTyping: (isTyping, speaker = null) => set({
    isTyping,
    typingSpeaker: speaker,
  }),

  setWorkflowSteps: (steps) => set({ workflowSteps: steps }),

  updateWorkflowStep: (stepId, status) => set((state) => ({
    workflowSteps: state.workflowSteps.map((step) =>
      step.id === stepId ? { ...step, status } : step
    ),
  })),

  showAction: (action) => set((state) => {
    const exists = state.visibleActions.some((a) => a.id === action.id)
    if (exists) return state
    return {
      visibleActions: [...state.visibleActions, { ...action, visible: true }],
    }
  }),

  completeAction: (actionId) => set((state) => ({
    visibleActions: state.visibleActions.map((action) =>
      action.id === actionId
        ? { ...action, completed: true, completedAt: new Date().toISOString() }
        : action
    ),
  })),

  showKnowledge: (article) => set((state) => {
    const exists = state.visibleKnowledge.some((k) => k.id === article.id)
    if (exists) return state
    return {
      visibleKnowledge: [...state.visibleKnowledge, { ...article, visible: true }],
    }
  }),

  hideKnowledge: (articleId) => set((state) => ({
    visibleKnowledge: state.visibleKnowledge.filter((k) => k.id !== articleId),
  })),

  showComplianceAlert: (rule) => set((state) => {
    const exists = state.activeComplianceAlerts.some((r) => r.id === rule.id)
    if (exists) return state
    return {
      activeComplianceAlerts: [...state.activeComplianceAlerts, rule],
    }
  }),

  acknowledgeComplianceAlert: (ruleId) => set((state) => ({
    activeComplianceAlerts: state.activeComplianceAlerts.map((rule) =>
      rule.id === ruleId
        ? { ...rule, acknowledged: true, acknowledgedAt: new Date().toISOString() }
        : rule
    ),
  })),

  startCall: () => set({
    phase: 'active',
    callStartTime: new Date(),
  }),

  endCall: () => set({
    phase: 'post_call',
    callEndTime: new Date(),
  }),

  setDisposition: (disposition) => set({ selectedDisposition: disposition }),

  reset: () => set(initialState),
}))
