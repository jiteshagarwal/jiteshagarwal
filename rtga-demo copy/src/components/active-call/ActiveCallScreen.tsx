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
} from 'lucide-react'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { useCallStateStore } from '@/stores/callStateStore'
import { useUIStore } from '@/stores/uiStore'
import { useSimulation } from '@/hooks/useSimulation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const { soundEnabled, activeRightPanel, toggleSound, setActiveRightPanel } =
    useUIStore()

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
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-[60%] flex flex-col border-r"
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

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-[40%] flex flex-col"
        >
          <Tabs
            value={activeRightPanel}
            onValueChange={(v) => setActiveRightPanel(v as typeof activeRightPanel)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 p-0 h-auto">
              <TabsTrigger
                value="workflow"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Workflow
              </TabsTrigger>
              <TabsTrigger
                value="actions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Actions
              </TabsTrigger>
              <TabsTrigger
                value="knowledge"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Knowledge
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Compliance
                {unacknowledgedAlerts > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                  >
                    {unacknowledgedAlerts}
                  </motion.span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="flex-1 m-0 overflow-hidden">
              <WorkflowPanel />
            </TabsContent>
            <TabsContent value="actions" className="flex-1 m-0 overflow-hidden">
              <ActionsPanel />
            </TabsContent>
            <TabsContent value="knowledge" className="flex-1 m-0 overflow-hidden">
              <KnowledgePanel />
            </TabsContent>
            <TabsContent value="compliance" className="flex-1 m-0 overflow-hidden">
              <CompliancePanel />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
