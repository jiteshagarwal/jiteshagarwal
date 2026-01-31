import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Shield } from 'lucide-react'
import { useCallStateStore } from '@/stores/callStateStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ComplianceRule, ComplianceType } from '@/types/demo-script'

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
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              animate={
                !rule.acknowledged
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ repeat: rule.acknowledged ? 0 : Infinity, duration: 1.5 }}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                styles.iconBg
              )}
            >
              <Icon className={cn('w-5 h-5', styles.iconColor)} />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'text-xs font-medium uppercase',
                    styles.textColor
                  )}
                >
                  {rule.acknowledged ? 'Acknowledged' : rule.type}
                </span>
              </div>
              <p className="text-sm">{rule.message}</p>
              {!rule.acknowledged && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => acknowledgeComplianceAlert(rule.id)}
                >
                  Acknowledge
                </Button>
              )}
              {rule.acknowledged && rule.acknowledgedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Acknowledged at{' '}
                  {new Date(rule.acknowledgedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function CompliancePanel() {
  const activeComplianceAlerts = useCallStateStore(
    (state) => state.activeComplianceAlerts
  )

  const unacknowledged = activeComplianceAlerts.filter((r) => !r.acknowledged)
  const acknowledged = activeComplianceAlerts.filter((r) => r.acknowledged)

  return (
    <div className="h-full overflow-y-auto p-4">
      {activeComplianceAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <Shield className="w-12 h-12 mb-4 opacity-50" />
          <p>No compliance alerts</p>
          <p className="text-sm mt-1">
            Alerts will appear when compliance actions are needed
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {unacknowledged.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Requires Attention ({unacknowledged.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {unacknowledged.map((rule) => (
                    <ComplianceCard key={rule.id} rule={rule} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {acknowledged.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Acknowledged ({acknowledged.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {acknowledged.map((rule) => (
                    <ComplianceCard key={rule.id} rule={rule} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
