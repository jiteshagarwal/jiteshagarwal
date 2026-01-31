import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useCallStateStore } from '@/stores/callStateStore'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { cn } from '@/lib/utils'
import type { WorkflowStepStatus } from '@/types/demo-script'

function StepIcon({ status }: { status: WorkflowStepStatus }) {
  switch (status) {
    case 'completed':
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-6 h-6 rounded-full bg-success flex items-center justify-center"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </motion.div>
      )
    case 'in_progress':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        >
          <Loader2 className="w-4 h-4 text-white" />
        </motion.div>
      )
    case 'skipped':
      return (
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
          <Circle className="w-4 h-4 text-muted-foreground" />
        </div>
      )
    default:
      return (
        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
          <Circle className="w-3 h-3 text-muted-foreground/30" />
        </div>
      )
  }
}

export function WorkflowPanel() {
  const workflowSteps = useCallStateStore((state) => state.workflowSteps)
  const workflow = useDemoScriptStore((state) => state.script?.workflow)

  const completedCount = workflowSteps.filter((s) => s.status === 'completed').length
  const totalCount = workflowSteps.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{workflow?.name || 'Workflow'}</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount} / {totalCount}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-success rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg transition-colors',
                step.status === 'in_progress' && 'bg-primary/5',
                step.status === 'completed' && 'bg-success/5'
              )}
            >
              <div className="flex flex-col items-center">
                <StepIcon status={step.status} />
                {index < workflowSteps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 h-8 mt-1',
                      step.status === 'completed' ? 'bg-success' : 'bg-muted'
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <p
                  className={cn(
                    'font-medium',
                    step.status === 'completed' && 'text-success',
                    step.status === 'in_progress' && 'text-primary',
                    step.status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
