import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Send,
  Database,
  Globe,
  Mail,
  Calendar,
  FileText,
  Command,
} from 'lucide-react'
import { useCallStateStore } from '@/stores/callStateStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AgentToolType } from '@/types/demo-script'

interface Tool {
  id: AgentToolType
  name: string
  shortcut: string
  description: string
  icon: typeof Database
}

const AVAILABLE_TOOLS: Tool[] = [
  {
    id: 'crm',
    name: 'Push to CRM',
    shortcut: 'crm',
    description: 'Update customer record in CRM',
    icon: Database,
  },
  {
    id: 'search',
    name: 'Search Google',
    shortcut: 'google',
    description: 'Search for information online',
    icon: Globe,
  },
  {
    id: 'email',
    name: 'Send Email',
    shortcut: 'email',
    description: 'Draft and queue email to customer',
    icon: Mail,
  },
  {
    id: 'calendar',
    name: 'Schedule Follow-up',
    shortcut: 'calendar',
    description: 'Create calendar reminder',
    icon: Calendar,
  },
  {
    id: 'notes',
    name: 'Add Note',
    shortcut: 'notes',
    description: 'Add note to call record',
    icon: FileText,
  },
]

// Simulated AI responses for questions
const simulateAnswer = (query: string): string => {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('platinum') || lowerQuery.includes('benefits')) {
    return 'Platinum card benefits include: 2x reward points, complimentary airport lounge access (8 visits/year), travel insurance up to Rs. 50 lakhs, and no foreign transaction fees. Annual fee is Rs. 2,999, waived on Rs. 3 lakh annual spend.'
  }
  if (lowerQuery.includes('delivery') || lowerQuery.includes('shipping')) {
    return 'Standard delivery: 5-7 business days (free). Express delivery: 24-48 hours (Rs. 299 for Standard, Rs. 199 for Gold, free for Platinum). Real-time tracking is provided for express orders.'
  }
  if (lowerQuery.includes('block') || lowerQuery.includes('lost')) {
    return 'To block a lost card: 1) Verify customer identity, 2) Block card immediately in system, 3) Check for unauthorized transactions in last 48 hours, 4) Offer replacement options, 5) Provide reference number.'
  }
  if (lowerQuery.includes('fraud') || lowerQuery.includes('unauthorized')) {
    return 'Zero liability policy applies to all unauthorized transactions reported within 48 hours. Fraud team can be reached at ext. 4567. All suspicious activity should be escalated immediately.'
  }
  if (lowerQuery.includes('upgrade') || lowerQuery.includes('tier')) {
    return 'Eligible customers can upgrade tiers based on: spending history, account tenure, and payment behavior. Gold to Platinum upgrade requires 2+ years membership and Rs. 2L+ annual spend. First-year fee waiver available for qualified customers.'
  }

  return `Based on our knowledge base, here's what I found for "${query}": This topic is covered in our standard procedures. Please refer to the relevant knowledge article or escalate to a supervisor if additional guidance is needed.`
}

export function SearchBar() {
  const [input, setInput] = useState('')
  const [showToolMenu, setShowToolMenu] = useState(false)
  const [selectedToolIndex, setSelectedToolIndex] = useState(0)
  const [filteredTools, setFilteredTools] = useState<Tool[]>(AVAILABLE_TOOLS)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const executeTool = useCallStateStore((state) => state.executeTool)
  const addSearchResult = useCallStateStore((state) => state.addSearchResult)

  useEffect(() => {
    if (input.startsWith('\\')) {
      setShowToolMenu(true)
      const searchTerm = input.slice(1).toLowerCase()
      const filtered = AVAILABLE_TOOLS.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchTerm) ||
          tool.shortcut.toLowerCase().includes(searchTerm)
      )
      setFilteredTools(filtered.length > 0 ? filtered : AVAILABLE_TOOLS)
      setSelectedToolIndex(0)
    } else {
      setShowToolMenu(false)
      setFilteredTools(AVAILABLE_TOOLS)
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showToolMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedToolIndex((prev) =>
          prev < filteredTools.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedToolIndex((prev) =>
          prev > 0 ? prev - 1 : filteredTools.length - 1
        )
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        if (filteredTools[selectedToolIndex]) {
          selectTool(filteredTools[selectedToolIndex])
        }
      } else if (e.key === 'Escape') {
        setShowToolMenu(false)
        setInput('')
      }
    } else if (e.key === 'Enter' && input.trim()) {
      handleSubmit()
    }
  }

  const selectTool = (tool: Tool) => {
    setShowToolMenu(false)
    // Execute the tool
    executeTool(tool.id, tool.name)
    setInput('')
  }

  const handleSubmit = () => {
    if (!input.trim()) return

    if (input.startsWith('\\')) {
      // Tool command - already handled by menu selection
      return
    }

    // Regular question - simulate AI answer
    const answer = simulateAnswer(input)
    addSearchResult(input, answer)
    setInput('')
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or type \ for tools..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1">
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="w-3 h-3" />
            \
          </kbd>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={handleSubmit}
            disabled={!input.trim() || showToolMenu}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showToolMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="p-2 border-b bg-muted/30">
              <span className="text-xs text-muted-foreground">
                Available Tools
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredTools.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => selectTool(tool)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                      index === selectedToolIndex
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-md flex items-center justify-center',
                        index === selectedToolIndex
                          ? 'bg-primary/20'
                          : 'bg-muted'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tool.name}</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">
                          \{tool.shortcut}
                        </kbd>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
