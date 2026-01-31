import { useCallback, useRef } from 'react'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { useCallStateStore } from '@/stores/callStateStore'
import { useUIStore } from '@/stores/uiStore'
import type { Trigger, ConversationMessage } from '@/types/demo-script'

export function useSimulation() {
  const script = useDemoScriptStore((state) => state.script)
  const {
    phase,
    currentMessageIndex,
    isTyping,
    advanceMessage,
    addDisplayedMessage,
    setTyping,
    setWorkflowSteps,
    updateWorkflowStep,
    showAction,
    completeAction,
    showKnowledge,
    showComplianceAlert,
    startCall,
    endCall,
  } = useCallStateStore()

  const { soundEnabled } = useUIStore()
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const playSound = useCallback(
    (soundType: 'notification' | 'ring' | 'message') => {
      if (!soundEnabled) return

      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      switch (soundType) {
        case 'ring':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(520, audioContext.currentTime + 0.1)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
          break
        case 'notification':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.05)
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.2)
          break
        case 'message':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.1)
          break
      }
    },
    [soundEnabled]
  )

  const processTriggers = useCallback(
    (triggers: Trigger[]) => {
      if (!script) return

      triggers.forEach((trigger) => {
        const processAction = () => {
          switch (trigger.type) {
            case 'show_action': {
              const action = script.actions.find((a) => a.id === trigger.targetId)
              if (action) {
                showAction(action)
                playSound('notification')
              }
              break
            }
            case 'update_workflow': {
              updateWorkflowStep(trigger.targetId, 'completed')
              const stepIndex = script.workflow.steps.findIndex(
                (s) => s.id === trigger.targetId
              )
              if (stepIndex < script.workflow.steps.length - 1) {
                updateWorkflowStep(
                  script.workflow.steps[stepIndex + 1].id,
                  'in_progress'
                )
              }
              break
            }
            case 'show_knowledge': {
              const article = script.knowledge.find((k) => k.id === trigger.targetId)
              if (article) {
                showKnowledge(article)
                playSound('notification')
              }
              break
            }
            case 'show_compliance': {
              const rule = script.complianceRules.find(
                (r) => r.id === trigger.targetId
              )
              if (rule) {
                showComplianceAlert(rule)
                playSound('notification')
              }
              break
            }
            case 'complete_action': {
              completeAction(trigger.targetId)
              break
            }
          }
        }

        if (trigger.delay) {
          const timeout = setTimeout(processAction, trigger.delay)
          triggerTimeoutsRef.current.push(timeout)
        } else {
          processAction()
        }
      })
    },
    [
      script,
      showAction,
      updateWorkflowStep,
      showKnowledge,
      showComplianceAlert,
      completeAction,
      playSound,
    ]
  )

  const showMessage = useCallback(
    (message: ConversationMessage) => {
      setTyping(true, message.speaker)

      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false)
        addDisplayedMessage(message)
        playSound('message')

        if (message.triggers && message.triggers.length > 0) {
          processTriggers(message.triggers)
        }
      }, 1000)
    },
    [setTyping, addDisplayedMessage, processTriggers, playSound]
  )

  const nextMessage = useCallback(() => {
    if (!script || phase !== 'active' || isTyping) return

    const nextIndex = currentMessageIndex + 1
    if (nextIndex >= script.conversation.length) {
      endCall()
      return
    }

    advanceMessage()
    const message = script.conversation[nextIndex]
    showMessage(message)
  }, [script, phase, currentMessageIndex, isTyping, advanceMessage, showMessage, endCall])

  const acceptCall = useCallback(() => {
    if (!script) return

    setWorkflowSteps(script.workflow.steps)
    if (script.workflow.steps.length > 0) {
      updateWorkflowStep(script.workflow.steps[0].id, 'in_progress')
    }

    startCall()
    playSound('notification')
  }, [script, startCall, setWorkflowSteps, updateWorkflowStep, playSound])

  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    triggerTimeoutsRef.current.forEach(clearTimeout)
    triggerTimeoutsRef.current = []
  }, [])

  const hasMoreMessages = script
    ? currentMessageIndex < script.conversation.length - 1
    : false

  return {
    nextMessage,
    acceptCall,
    cleanup,
    playSound,
    hasMoreMessages,
    canAdvance: phase === 'active' && !isTyping && hasMoreMessages,
    messageCount: script?.conversation.length ?? 0,
    currentIndex: currentMessageIndex + 1,
  }
}
