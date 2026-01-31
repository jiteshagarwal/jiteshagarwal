export type Sentiment = 'positive' | 'neutral' | 'negative'
export type CustomerTier = 'standard' | 'gold' | 'platinum'
export type AccountType = 'savings' | 'checking' | 'credit_card' | 'loan' | 'investment' | 'insurance'
export type CallOutcome = 'resolved' | 'escalated' | 'follow_up' | 'abandoned'
export type Speaker = 'customer' | 'agent'
export type TriggerType = 'show_action' | 'update_workflow' | 'show_knowledge' | 'show_compliance' | 'complete_action'
export type ActionType = 'button' | 'form' | 'confirmation'
export type ComplianceType = 'warning' | 'reminder' | 'required'
export type WorkflowStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
export type AgentToolType = 'crm' | 'search' | 'email' | 'calendar' | 'notes'
export type HubItemType = 'action' | 'compliance' | 'tool_result' | 'search_result'
export type DispositionCode =
  | 'issue_resolved'
  | 'follow_up_needed'
  | 'escalated'
  | 'customer_callback'
  | 'no_resolution'
  | 'information_provided'

export interface Metadata {
  id: string
  name: string
  description: string
  version?: string
  createdAt?: string
}

export interface Customer {
  id: string
  name: string
  tier: CustomerTier
  accountType: AccountType
  accountNumber?: string
  memberSince?: string
  phone?: string
  email?: string
  preferredLanguage?: string
}

export interface CallHistoryItem {
  id: string
  date: string
  reason: string
  outcome: CallOutcome
  summary: string
  agentName?: string
  duration?: number
}

export interface Prediction {
  primaryReason: string
  confidence: number
  secondaryReasons?: Array<{
    reason: string
    confidence: number
  }>
}

export interface Trigger {
  type: TriggerType
  targetId: string
  delay?: number
}

export interface ConversationMessage {
  id: string
  timestamp: string
  speaker: Speaker
  content: string
  sentiment?: Sentiment
  triggers?: Trigger[]
}

export interface WorkflowStep {
  id: string
  title: string
  description?: string
  status: WorkflowStepStatus
}

export interface Workflow {
  id: string
  name: string
  steps: WorkflowStep[]
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'select' | 'checkbox' | 'date' | 'number'
  value?: string | boolean | number
  options?: string[]
  required?: boolean
  disabled?: boolean
}

export interface Action {
  id: string
  type: ActionType
  title: string
  description?: string
  icon?: string
  prefilledData?: Record<string, string | boolean | number>
  formFields?: FormField[]
  priority?: 'low' | 'medium' | 'high'
  visible?: boolean
  completed?: boolean
  completedAt?: string
}

export interface KnowledgeArticle {
  id: string
  title: string
  excerpt: string
  fullContent: string
  category?: string
  tags?: string[]
  visible?: boolean
  // Q&A format fields
  question?: string
  answer?: string
}

export interface AgentTool {
  id: string
  type: AgentToolType
  name: string
  description: string
  icon: string
  shortcut: string // e.g., "crm", "google", "email"
}

export interface ToolExecution {
  id: string
  toolId: string
  toolName: string
  toolType: AgentToolType
  input?: string
  result: string
  status: 'pending' | 'success' | 'error'
  timestamp: string
}

export interface SearchResult {
  id: string
  query: string
  answer: string
  timestamp: string
}

export interface HubItem {
  id: string
  type: HubItemType
  timestamp: string
  data: Action | ComplianceRule | ToolExecution | SearchResult
}

export interface ComplianceRule {
  id: string
  type: ComplianceType
  message: string
  triggeredByMessageId?: string
  acknowledged?: boolean
  acknowledgedAt?: string
}

export interface PostCallSummary {
  summary: string
  keyPoints: string[]
  sentiment: Sentiment
  disposition: DispositionCode
  recommendedFollowUp?: string
  actionsTaken?: string[]
}

export interface AIHandoffSummary {
  completedSteps: string[]
  context: string
  openQuestion: string
}

export interface DemoScript {
  metadata: Metadata
  customer: Customer
  callHistory: CallHistoryItem[]
  prediction: Prediction
  aiHandoffSummary?: AIHandoffSummary
  conversation: ConversationMessage[]
  workflow: Workflow
  actions: Action[]
  knowledge: KnowledgeArticle[]
  complianceRules: ComplianceRule[]
  postCall: PostCallSummary
}

export type CallPhase = 'idle' | 'incoming' | 'active' | 'post_call'
