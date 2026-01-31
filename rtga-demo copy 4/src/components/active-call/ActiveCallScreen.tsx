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
  Lightbulb,
} from 'lucide-react'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { useCallStateStore } from '@/stores/callStateStore'
import { useUIStore } from '@/stores/uiStore'
import { useSimulation } from '@/hooks/useSimulation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConversationPanel } from './conversation/ConversationPanel'
import { WorkflowPanel } from './workflow/WorkflowPanel'
import { KnowledgePanel } from './knowledge/KnowledgePanel'
import { AgentHubPanel } from './agent-hub/AgentHubPanel'
import { SearchBar } from './search/SearchBar'

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
  const visibleActions = useCallStateStore((state) => state.visibleActions)
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
  const incompleteActions = visibleActions.filter((a) => !a.completed).length
  const pendingCount = unacknowledgedAlerts + incompleteActions

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

      {/* Search Bar - Top Center */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex-shrink-0 px-6 py-3 border-b bg-card/50"
      >
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Conversation */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-[25%] flex flex-col border-r"
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

        {/* Center Panel - Agent Hub (Full Height) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="w-[45%] flex flex-col border-r overflow-hidden"
        >
          <div className="flex-shrink-0 px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Agent Hub</span>
              {pendingCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                >
                  {pendingCount}
                </motion.span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <AgentHubPanel />
          </div>
        </motion.div>

        {/* Right Panel - Workflow (Top) and Insights (Bottom) */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-[30%] flex flex-col overflow-hidden"
        >
          {/* Top - Workflow */}
          <div className="h-1/2 flex flex-col border-b overflow-hidden">
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

          {/* Bottom - Insights */}
          <div className="h-1/2 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Insights</span>
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
