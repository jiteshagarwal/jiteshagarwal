import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  CreditCard,
  Package,
  Gift,
  Shield,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Info,
  Database,
  Globe,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useCallStateStore } from '@/stores/callStateStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Action, ComplianceRule, ComplianceType, ToolExecution, SearchResult, AgentToolType } from '@/types/demo-script'

// Action icons
function getActionIcon(iconName?: string) {
  switch (iconName) {
    case 'credit-card':
      return CreditCard
    case 'package':
      return Package
    case 'gift':
      return Gift
    case 'shield':
      return Shield
    default:
      return CreditCard
  }
}

// Compliance icons
function getComplianceIcon(type: ComplianceType) {
  switch (type) {
    case 'warning':
      return AlertTriangle
    case 'required':
      return AlertCircle
    default:
      return Info
  }
}

// Tool icons
function getToolIcon(type: AgentToolType) {
  switch (type) {
    case 'crm':
      return Database
    case 'search':
      return Globe
    case 'email':
      return Mail
    case 'calendar':
      return Calendar
    case 'notes':
      return FileText
    default:
      return Zap
  }
}

function getComplianceStyles(type: ComplianceType, acknowledged: boolean) {
  if (acknowledged) {
    return {
      bg: 'bg-success/5 border-success/20',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      textColor: 'text-success',
    }
  }

  switch (type) {
    case 'warning':
      return {
        bg: 'bg-warning/5 border-warning/20',
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
        textColor: 'text-warning-foreground',
      }
    case 'required':
      return {
        bg: 'bg-destructive/5 border-destructive/20',
        iconBg: 'bg-destructive/10',
        iconColor: 'text-destructive',
        textColor: 'text-destructive',
      }
    default:
      return {
        bg: 'bg-info/5 border-info/20',
        iconBg: 'bg-info/10',
        iconColor: 'text-info',
        textColor: 'text-info-foreground',
      }
  }
}

// Action Card Component
function ActionCard({ action }: { action: Action }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const completeAction = useCallStateStore((state) => state.completeAction)

  const Icon = getActionIcon(action.icon)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Card
        className={cn(
          'transition-all',
          action.completed && 'border-success bg-success/5'
        )}
      >
        <CardHeader className="p-3 pb-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  action.completed ? 'bg-success/10' : 'bg-primary/10'
                )}
              >
                {action.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Icon className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-sm">{action.title}</CardTitle>
                {action.priority && (
                  <Badge
                    variant={
                      action.priority === 'high'
                        ? 'destructive'
                        : action.priority === 'medium'
                        ? 'warning'
                        : 'secondary'
                    }
                    className="mt-0.5 text-[9px]"
                  >
                    {action.priority}
                  </Badge>
                )}
              </div>
            </div>
            {action.formFields && action.formFields.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          {action.description && (
            <p className="text-xs text-muted-foreground mb-2">
              {action.description}
            </p>
          )}

          <AnimatePresence>
            {isExpanded && action.formFields && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 py-2 border-t mb-2">
                  {action.formFields.map((field) => (
                    <div key={field.id}>
                      <label className="text-xs font-medium text-muted-foreground">
                        {field.label}
                      </label>
                      <div className="mt-0.5 px-2 py-1 rounded-md bg-muted text-xs">
                        {String(
                          action.prefilledData?.[field.id] ?? field.value ?? '-'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!action.completed && (
            <Button onClick={() => completeAction(action.id)} className="w-full" size="sm">
              {action.type === 'confirmation' ? 'Confirm' : 'Complete'}
            </Button>
          )}

          {action.completed && (
            <div className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Compliance Card Component
function ComplianceCard({ rule }: { rule: ComplianceRule }) {
  const acknowledgeComplianceAlert = useCallStateStore(
    (state) => state.acknowledgeComplianceAlert
  )

  const Icon = rule.acknowledged ? CheckCircle2 : getComplianceIcon(rule.type)
  const styles = getComplianceStyles(rule.type, rule.acknowledged || false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Card className={cn('border transition-all', styles.bg)}>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <motion.div
              animate={
                !rule.acknowledged ? { scale: [1, 1.1, 1] } : {}
              }
              transition={{ repeat: rule.acknowledged ? 0 : Infinity, duration: 1.5 }}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                styles.iconBg
              )}
            >
              <Icon className={cn('w-4 h-4', styles.iconColor)} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    'text-[10px] font-medium uppercase',
                    styles.textColor
                  )}
                >
                  {rule.acknowledged ? 'Done' : rule.type}
                </span>
              </div>
              <p className="text-xs">{rule.message}</p>
              {!rule.acknowledged && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => acknowledgeComplianceAlert(rule.id)}
                >
                  Acknowledge
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Tool Result Card Component
function ToolResultCard({ execution }: { execution: ToolExecution }) {
  const Icon = getToolIcon(execution.toolType)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-primary">
                  {execution.toolName}
                </span>
                <Badge variant="secondary" className="text-[9px]">
                  Tool
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{execution.result}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(execution.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Search Result Card Component
function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Card className="border-info/20 bg-info/5">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-info" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-info">
                  AI Answer
                </span>
                <Badge variant="secondary" className="text-[9px]">
                  Q&A
                </Badge>
              </div>
              <p className="text-xs font-medium mb-1">Q: {result.query}</p>
              <p className="text-xs text-muted-foreground">{result.answer}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(result.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AgentHubPanel() {
  const visibleActions = useCallStateStore((state) => state.visibleActions)
  const activeComplianceAlerts = useCallStateStore(
    (state) => state.activeComplianceAlerts
  )
  const toolExecutions = useCallStateStore((state) => state.toolExecutions)
  const searchResults = useCallStateStore((state) => state.searchResults)

  // Combine all items with timestamps for chronological view
  const allItems = [
    ...toolExecutions.map((t) => ({ type: 'tool' as const, data: t, timestamp: t.timestamp })),
    ...searchResults.map((s) => ({ type: 'search' as const, data: s, timestamp: s.timestamp })),
    ...visibleActions.map((a) => ({
      type: 'action' as const,
      data: a,
      timestamp: a.completedAt || new Date().toISOString(),
    })),
    ...activeComplianceAlerts.map((c) => ({
      type: 'compliance' as const,
      data: c,
      timestamp: c.acknowledgedAt || new Date().toISOString(),
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const hasContent =
    visibleActions.length > 0 ||
    activeComplianceAlerts.length > 0 ||
    toolExecutions.length > 0 ||
    searchResults.length > 0

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Content - All items in chronological order */}
      <div className="flex-1 overflow-y-auto p-3">
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">No items yet</p>
            <p className="text-xs mt-1">
              Actions, compliance alerts, and results will appear here in chronological order
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {allItems.map((item) => {
                if (item.type === 'action') {
                  return <ActionCard key={`action-${item.data.id}`} action={item.data as Action} />
                }
                if (item.type === 'compliance') {
                  return <ComplianceCard key={`compliance-${item.data.id}`} rule={item.data as ComplianceRule} />
                }
                if (item.type === 'tool') {
                  return <ToolResultCard key={`tool-${item.data.id}`} execution={item.data as ToolExecution} />
                }
                if (item.type === 'search') {
                  return <SearchResultCard key={`search-${item.data.id}`} result={item.data as SearchResult} />
                }
                return null
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
