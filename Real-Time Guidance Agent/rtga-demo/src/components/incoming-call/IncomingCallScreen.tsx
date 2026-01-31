import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  User,
  CreditCard,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Bot,
  MessageSquare,
} from 'lucide-react'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { useSimulation } from '@/hooks/useSimulation'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CustomerTier } from '@/types/demo-script'

function getTierBadgeVariant(tier: CustomerTier) {
  switch (tier) {
    case 'gold':
      return 'gold'
    case 'platinum':
      return 'platinum'
    default:
      return 'secondary'
  }
}

export function IncomingCallScreen() {
  const script = useDemoScriptStore((state) => state.script)
  const { acceptCall, playSound } = useSimulation()
  const { resetDemo } = useFileUpload()

  useEffect(() => {
    const interval = setInterval(() => {
      playSound('ring')
    }, 2000)

    return () => clearInterval(interval)
  }, [playSound])

  if (!script) return null

  const { customer, prediction, aiHandoffSummary } = script

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold text-foreground">Incoming Call</h1>
          <Button variant="ghost" onClick={resetDemo}>
            Cancel
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <User className="w-10 h-10 text-primary" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{customer.name}</h2>
                      <Badge variant={getTierBadgeVariant(customer.tier)}>
                        {customer.tier.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        <span className="capitalize">
                          {customer.accountType.replace('_', ' ')}
                        </span>
                      </div>
                      {customer.memberSince && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Member since {customer.memberSince}</span>
                        </div>
                      )}
                      {customer.accountNumber && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-mono">
                            ****{customer.accountNumber.slice(-4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Call Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-lg">{prediction.primaryReason}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.confidence}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {prediction.confidence}%
                      </span>
                    </div>
                  </div>
                  {prediction.secondaryReasons && prediction.secondaryReasons.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        Other possibilities:
                      </p>
                      {prediction.secondaryReasons.map((reason, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <span className="text-muted-foreground">
                            {reason.reason}
                          </span>
                          <span className="text-xs">{reason.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {aiHandoffSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Agent Handoff Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-primary mb-1">Context</p>
                          <p className="text-sm text-muted-foreground">{aiHandoffSummary.context}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm mb-3">Steps Completed by AI Agent:</p>
                      <div className="space-y-2">
                        {aiHandoffSummary.completedSteps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                          >
                            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{step}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                      <p className="font-medium text-sm text-warning mb-1">Open Question for You:</p>
                      <p className="text-sm text-muted-foreground">{aiHandoffSummary.openQuestion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0)',
                '0 0 0 15px rgba(34, 197, 94, 0.1)',
                '0 0 0 0 rgba(34, 197, 94, 0)',
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
            className="rounded-full"
          >
            <Button
              onClick={acceptCall}
              size="lg"
              variant="success"
              className="rounded-full px-12 py-6 text-lg"
            >
              <Phone className="w-6 h-6 mr-2" />
              Accept Call
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
