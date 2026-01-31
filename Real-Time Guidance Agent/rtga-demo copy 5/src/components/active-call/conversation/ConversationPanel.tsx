import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Headphones } from 'lucide-react'
import { useCallStateStore } from '@/stores/callStateStore'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Sentiment } from '@/types/demo-script'

function getSentimentVariant(sentiment: Sentiment) {
  switch (sentiment) {
    case 'positive':
      return 'positive'
    case 'negative':
      return 'negative'
    default:
      return 'neutral'
  }
}

function TypingIndicator({ speaker }: { speaker: 'customer' | 'agent' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-start gap-3 mb-4',
        speaker === 'agent' ? 'flex-row-reverse' : ''
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          speaker === 'customer' ? 'bg-muted' : 'bg-primary/10'
        )}
      >
        {speaker === 'customer' ? (
          <User className="w-4 h-4" />
        ) : (
          <Headphones className="w-4 h-4 text-primary" />
        )}
      </div>
      <div
        className={cn(
          'rounded-2xl px-4 py-3',
          speaker === 'customer'
            ? 'bg-muted rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        <div className="flex gap-1">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            className={cn(
              'w-2 h-2 rounded-full',
              speaker === 'customer' ? 'bg-muted-foreground/50' : 'bg-primary-foreground/50'
            )}
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
            className={cn(
              'w-2 h-2 rounded-full',
              speaker === 'customer' ? 'bg-muted-foreground/50' : 'bg-primary-foreground/50'
            )}
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
            className={cn(
              'w-2 h-2 rounded-full',
              speaker === 'customer' ? 'bg-muted-foreground/50' : 'bg-primary-foreground/50'
            )}
          />
        </div>
      </div>
    </motion.div>
  )
}

export function ConversationPanel() {
  const displayedMessages = useCallStateStore((state) => state.displayedMessages)
  const isTyping = useCallStateStore((state) => state.isTyping)
  const typingSpeaker = useCallStateStore((state) => state.typingSpeaker)
  const customer = useDemoScriptStore((state) => state.script?.customer)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayedMessages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence mode="popLayout">
        {displayedMessages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'flex items-start gap-3',
              message.speaker === 'agent' ? 'flex-row-reverse' : ''
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                message.speaker === 'customer' ? 'bg-muted' : 'bg-primary/10'
              )}
            >
              {message.speaker === 'customer' ? (
                <User className="w-4 h-4" />
              ) : (
                <Headphones className="w-4 h-4 text-primary" />
              )}
            </div>
            <div
              className={cn(
                'max-w-[70%] space-y-1',
                message.speaker === 'agent' ? 'items-end' : ''
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {message.speaker === 'customer' ? customer?.name : 'Agent'}
                </span>
                {message.sentiment && (
                  <Badge
                    variant={getSentimentVariant(message.sentiment)}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {message.sentiment}
                  </Badge>
                )}
              </div>
              <div
                className={cn(
                  'rounded-2xl px-4 py-3',
                  message.speaker === 'customer'
                    ? 'bg-muted rounded-tl-none'
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {message.timestamp}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {isTyping && typingSpeaker && <TypingIndicator speaker={typingSpeaker} />}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  )
}
