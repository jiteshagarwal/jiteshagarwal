import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  FileText,
  User,
  Smile,
  Meh,
  Frown,
} from 'lucide-react'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { useCallStateStore } from '@/stores/callStateStore'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Sentiment, DispositionCode } from '@/types/demo-script'

const dispositionLabels: Record<DispositionCode, string> = {
  issue_resolved: 'Issue Resolved',
  follow_up_needed: 'Follow-up Needed',
  escalated: 'Escalated',
  customer_callback: 'Customer Callback',
  no_resolution: 'No Resolution',
  information_provided: 'Information Provided',
}

function getSentimentIcon(sentiment: Sentiment) {
  switch (sentiment) {
    case 'positive':
      return Smile
    case 'negative':
      return Frown
    default:
      return Meh
  }
}

function getSentimentColor(sentiment: Sentiment) {
  switch (sentiment) {
    case 'positive':
      return 'text-success'
    case 'negative':
      return 'text-destructive'
    default:
      return 'text-muted-foreground'
  }
}

function formatDuration(start: Date | null, end: Date | null): string {
  if (!start || !end) return '00:00'
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000)
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${minutes}m ${seconds}s`
}

export function PostCallScreen() {
  const script = useDemoScriptStore((state) => state.script)
  const {
    callStartTime,
    callEndTime,
    displayedMessages,
    visibleActions,
    selectedDisposition,
    setDisposition,
  } = useCallStateStore()
  const { resetDemo } = useFileUpload()

  if (!script) return null

  const { customer, postCall } = script
  const SentimentIcon = getSentimentIcon(postCall.sentiment)

  const completedActions = visibleActions.filter((a) => a.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-success" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Call Completed
          </h1>
          <p className="text-muted-foreground">
            Review the call summary and set disposition
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold">
                      {formatDuration(callStartTime, callEndTime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Messages</p>
                    <p className="text-lg font-semibold">
                      {displayedMessages.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Actions Completed
                    </p>
                    <p className="text-lg font-semibold">
                      {completedActions.length} / {visibleActions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Call Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 mb-4 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="gold">{customer.tier.toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground capitalize">
                        {customer.accountType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SentimentIcon
                      className={`w-5 h-5 ${getSentimentColor(postCall.sentiment)}`}
                    />
                    <span className="text-sm font-medium capitalize">
                      {postCall.sentiment} Sentiment
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {postCall.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Key Points</h4>
                  <ul className="space-y-2">
                    {postCall.keyPoints.map((point, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Actions Taken</CardTitle>
              </CardHeader>
              <CardContent>
                {completedActions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No actions were completed during this call
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {completedActions.map((action, index) => (
                      <motion.li
                        key={action.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        <span>{action.title}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disposition</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedDisposition || postCall.disposition}
                  onValueChange={(value) =>
                    setDisposition(value as DispositionCode)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select disposition" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dispositionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {postCall.recommendedFollowUp && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">
                      Recommended Follow-up
                    </p>
                    <p className="text-sm">{postCall.recommendedFollowUp}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <Button onClick={resetDemo} size="lg" variant="outline">
            <RefreshCw className="w-5 h-5 mr-2" />
            Start New Demo
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
