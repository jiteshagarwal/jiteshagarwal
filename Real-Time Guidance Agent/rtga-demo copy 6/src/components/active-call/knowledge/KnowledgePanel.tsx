import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react'
import { useCallStateStore } from '@/stores/callStateStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { KnowledgeArticle } from '@/types/demo-script'

// Transform article content to Q&A pairs
function extractQAPairs(article: KnowledgeArticle): { question: string; answer: string }[] {
  // If article has explicit Q&A format, use it directly
  if (article.question && article.answer) {
    return [{ question: article.question, answer: article.answer }]
  }

  // Fallback: Generate Q&A from article content
  const pairs: { question: string; answer: string }[] = []

  // Create a main question from the title
  const mainQuestion = `What is the ${article.title.toLowerCase().replace(/procedure|process|guide/gi, '').trim()}?`
  pairs.push({
    question: mainQuestion,
    answer: article.excerpt,
  })

  return pairs.slice(0, 2) // Limit to 2 Q&A pairs per article for cleaner display
}

function QACard({
  qa,
  category,
}: {
  qa: { question: string; answer: string }
  category?: string
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Card className="relative border-info/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4 text-info" />
            </div>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  {category && (
                    <Badge variant="secondary" className="text-[9px]">
                      {category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground flex items-start gap-1">
                  <span className="text-info font-bold">Q:</span>
                  <span>{qa.question}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 flex-shrink-0 ml-auto text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0 ml-auto text-muted-foreground" />
                  )}
                </p>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pt-2 border-t border-info/10">
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-success font-bold">A:</span>
                        <span>{qa.answer}</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function KnowledgeArticleGroup({ article }: { article: KnowledgeArticle }) {
  const hideKnowledge = useCallStateStore((state) => state.hideKnowledge)
  const qaPairs = extractQAPairs(article)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {article.title}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1 text-[10px]"
          onClick={() => hideKnowledge(article.id)}
        >
          Dismiss
        </Button>
      </div>

      {qaPairs.map((qa, index) => (
        <QACard
          key={`${article.id}-qa-${index}`}
          qa={qa}
          category={index === 0 ? article.category : undefined}
        />
      ))}
    </div>
  )
}

export function KnowledgePanel() {
  const visibleKnowledge = useCallStateStore((state) => state.visibleKnowledge)

  return (
    <div className="h-full overflow-y-auto p-3">
      {visibleKnowledge.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <MessageCircle className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No insights available</p>
          <p className="text-xs mt-1">
            Relevant Q&As will appear based on context
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {visibleKnowledge.map((article) => (
              <KnowledgeArticleGroup key={article.id} article={article} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
