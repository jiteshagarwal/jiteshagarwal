import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  PhoneOff,
  ChevronRight,
  User,
  Clock,
  Volume2,
  VolumeX,
  GitBranch,
  Zap,
  ShieldCheck,
  BookOpen,
} from 'lucide-react'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { useCallStateStore } from '@/stores/callStateStore'
import { useUIStore } from '@/stores/uiStore'
import { useSimulation } from '@/hooks/useSimulation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConversationPanel } from './conversation/ConversationPanel'
import { WorkflowPanel } from './workflow/WorkflowPanel'
import { ActionsPanel } from './actions/ActionsPanel'
import { KnowledgePanel } from './knowledge/KnowledgePanel'
import { CompliancePanel } from './compliance/CompliancePanel'

function formatDuration(start: Date | null): string {
  if (!start) return '00:00'
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / 1000)
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function ActiveCallScreen() {
  const script = useDemoScriptStore((state) => state.script)
  const callStartTime = useCallStateStore((state) => state.callStartTime)
  const activeComplianceAlerts = useCallStateStore(
    (state) => state.activeComplianceAlerts
  )
  const { soundEnabled, toggleSound } = useUIStore()

  const { nextMessage, cleanup, canAdvance, currentIndex, messageCount } =
    useSimulation()

  const endCall = useCallStateStore((state) => state.endCall)

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render for clock
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!script) return null

  const unacknowledgedAlerts = activeComplianceAlerts.filter(
    (a) => !a.acknowledged
  ).length

  return (
    <div className="h-screen flex flex-col bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 border-b bg-card px-6 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-3 h-3 rounded-full bg-success"
              />
              <span className="font-medium">Active Call</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">
                {formatDuration(callStartTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{script.customer.name}</span>
              <Badge variant="gold" className="text-[10px]">
                {script.customer.tier.toUpperCase()}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            <Button variant="destructive" size="sm" onClick={endCall}>
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        {/* Transcription Panel - Reduced width */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-[35%] flex flex-col border-r"
        >
          <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-medium">Conversation</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentIndex} / {messageCount} messages
              </span>
            </div>
          </div>

          <ConversationPanel />

          <div className="flex-shrink-0 p-4 border-t bg-card">
            <Button
              onClick={nextMessage}
              disabled={!canAdvance}
              className="w-full"
              size="lg"
            >
              Next Message
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Right side - 2x2 Grid of all sections */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-[65%] grid grid-cols-2 grid-rows-[minmax(150px,35%)_1fr] overflow-hidden"
        >
          {/* Top Left - Workflow (smaller) */}
          <div className="border-b border-r flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Workflow</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <WorkflowPanel />
            </div>
          </div>

          {/* Top Right - Compliance */}
          <div className="border-b flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Compliance</span>
                {unacknowledgedAlerts > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                  >
                    {unacknowledgedAlerts}
                  </motion.span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <CompliancePanel />
            </div>
          </div>

          {/* Bottom Left - Actions */}
          <div className="border-r flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Actions</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ActionsPanel />
            </div>
          </div>

          {/* Bottom Right - Knowledge Base */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Knowledge Base</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <KnowledgePanel />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
