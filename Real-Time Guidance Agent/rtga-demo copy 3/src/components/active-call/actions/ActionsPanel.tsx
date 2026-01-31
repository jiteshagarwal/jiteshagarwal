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
} from 'lucide-react'
import { useCallStateStore } from '@/stores/callStateStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Action } from '@/types/demo-script'

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

function ActionCard({ action }: { action: Action }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const completeAction = useCallStateStore((state) => state.completeAction)

  const Icon = getActionIcon(action.icon)

  const handleComplete = () => {
    completeAction(action.id)
  }

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
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  action.completed ? 'bg-success/10' : 'bg-primary/10'
                )}
              >
                {action.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Icon className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                {action.priority && (
                  <Badge
                    variant={
                      action.priority === 'high'
                        ? 'destructive'
                        : action.priority === 'medium'
                        ? 'warning'
                        : 'secondary'
                    }
                    className="mt-1 text-[10px]"
                  >
                    {action.priority} priority
                  </Badge>
                )}
              </div>
            </div>
            {action.formFields && action.formFields.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {action.description && (
            <p className="text-sm text-muted-foreground mb-3">
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
                <div className="space-y-3 py-3 border-t mb-3">
                  {action.formFields.map((field) => (
                    <div key={field.id}>
                      <label className="text-sm font-medium text-muted-foreground">
                        {field.label}
                      </label>
                      <div className="mt-1 px-3 py-2 rounded-md bg-muted text-sm">
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
            <Button onClick={handleComplete} className="w-full" size="sm">
              {action.type === 'confirmation' ? 'Confirm' : 'Complete Action'}
            </Button>
          )}

          {action.completed && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ActionsPanel() {
  const visibleActions = useCallStateStore((state) => state.visibleActions)

  return (
    <div className="h-full overflow-y-auto p-4">
      {visibleActions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <CreditCard className="w-12 h-12 mb-4 opacity-50" />
          <p>No actions available yet</p>
          <p className="text-sm mt-1">
            Actions will appear as the conversation progresses
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {visibleActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
